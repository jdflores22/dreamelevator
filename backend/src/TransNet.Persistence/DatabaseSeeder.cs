using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TransNet.Application.Common;
using TransNet.Domain.Authorization;
using TransNet.Domain.Entities;
using TransNet.Persistence.SeedData;

namespace TransNet.Persistence;

public class DatabaseSeeder
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(ApplicationDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        await SeedPermissionsAsync();
        await SeedRolesAsync();
        await SeedMissingOperationalRolesAsync();
        await SeedAdminUserAsync();
        await SeedMissingInventoryPermissionsAsync();
        await SeedInventoryPartsIfEmptyAsync();

        var packApplied = await _context.SiteSettings.AnyAsync(s => s.Key == DeecContentAligner.PackKey);
        if (packApplied)
        {
            await SeedMissingIntroLabelsAsync();
            await SeedMissingServicesPageSettingsAsync();
            await SeedMissingAboutPageSettingsAsync();
            _logger.LogInformation("Existing CMS content found — skipping catalog seed so uploaded logos and edits stay as-is");
            return;
        }

        await SeedServicesAsync();
        await SeedProductsAsync();
        await SeedIndustriesAsync();
        await SeedFaqAsync();
        await SeedSiteStatsAsync();
        await SeedCompanyHighlightsAsync();
        await SeedProcessStepsAsync();
        await SeedTechnologiesAsync();
        await SeedClientsAsync();
        await SeedTestimonialsAsync();
        await SeedBlogsAsync();
        await SeedSiteSettingsAsync();
        await SeedSeoSettingsAsync();
        await SeedMissingSeoPagesAsync();
        await DeecContentAligner.ApplyAsync(_context);
        _logger.LogInformation("Initial DEEC content pack applied");
        _logger.LogInformation("Database seeding completed");
    }

    private async Task SeedPermissionsAsync()
    {
        if (await _context.Permissions.AnyAsync())
            return;

        var modules = new[]
        {
            "Dashboard", "Services", "Products", "Industries", "Faq", "SiteStats", "CompanyHighlights", "ProcessSteps", "Technologies", "Portfolio", "Projects", "Clients",
            "Blogs", "Testimonials", "Messages", "Careers", "Subscribers", "Settings", "Seo", "Users"
        };

        foreach (var module in modules)
        {
            _context.Permissions.Add(new Permission
            {
                Name = $"{module}.Read",
                Module = module
            });
            _context.Permissions.Add(new Permission
            {
                Name = $"{module}.Write",
                Module = module
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedRolesAsync()
    {
        if (await _context.Roles.AnyAsync())
            return;

        var superAdmin = new Role
        {
            Name = "SuperAdmin",
            Description = "Full system access"
        };
        var editor = new Role
        {
            Name = "Editor",
            Description = "Content management access"
        };

        _context.Roles.Add(superAdmin);
        _context.Roles.Add(editor);
        await _context.SaveChangesAsync();

        var allPermissions = await _context.Permissions.ToListAsync();
        foreach (var permission in allPermissions)
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = superAdmin.Id,
                PermissionId = permission.Id
            });
        }

        var editorModules = new[] { "Dashboard", "Services", "Products", "Industries", "Faq", "SiteStats", "CompanyHighlights", "ProcessSteps", "Technologies", "Portfolio", "Projects", "Clients", "Blogs", "Testimonials", "Messages", "Careers", "Subscribers", "Settings", "Seo" };
        foreach (var permission in allPermissions.Where(p => editorModules.Contains(p.Module)))
        {
            _context.RolePermissions.Add(new RolePermission
            {
                RoleId = editor.Id,
                PermissionId = permission.Id
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedMissingOperationalRolesAsync()
    {
        var needed = new (string Name, string Description)[]
        {
            (AppRoles.Staff, "Staff workspace — modules coming soon"),
            (AppRoles.Accounting, "Accounting workspace — modules coming soon"),
            (AppRoles.Admin, "Company admin workspace — modules coming soon"),
        };

        var added = 0;
        foreach (var (name, description) in needed)
        {
            if (await _context.Roles.AnyAsync(r => r.Name == name))
                continue;

            _context.Roles.Add(new Role { Name = name, Description = description });
            added++;
        }

        if (added == 0)
            return;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Added {Count} operational role(s) without CMS permissions", added);
    }

    private async Task SeedAdminUserAsync()
    {
        if (await _context.Users.AnyAsync())
            return;

        var superAdminRole = await _context.Roles.FirstAsync(r => r.Name == "SuperAdmin");
        _context.Users.Add(new User
        {
            Email = "admin@trans-net.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FirstName = "System",
            LastName = "Administrator",
            RoleId = superAdminRole.Id,
            IsActive = true
        });

        await _context.SaveChangesAsync();
    }

    private async Task SeedServicesAsync()
    {
        if (await _context.Services.AnyAsync())
            return;

        var services = new[]
        {
            ("Custom Software Development", "Tailored software solutions for your business needs."),
            ("Web Application Development", "Modern, responsive web applications built with cutting-edge technologies."),
            ("Mobile App Development", "Native and cross-platform mobile applications for iOS and Android."),
            ("Enterprise Systems", "Scalable enterprise-grade systems for large organizations."),
            ("Cloud Solutions", "Cloud migration, deployment, and management services."),
            ("API Integration", "Seamless integration of third-party APIs and services."),
            ("System Maintenance", "Ongoing maintenance and support for your software systems."),
            ("AI Solutions", "Artificial intelligence and machine learning solutions."),
            ("IT Consulting", "Strategic IT consulting to drive digital transformation."),
            ("Database Design", "Efficient database architecture and optimization."),
            ("Business Automation", "Workflow automation to streamline business processes."),
            ("DevOps", "CI/CD pipelines, infrastructure automation, and monitoring.")
        };

        var order = 1;
        foreach (var (title, description) in services)
        {
            _context.Services.Add(new Service
            {
                Title = title,
                Slug = SlugHelper.Generate(title),
                ShortDescription = description,
                Description = description,
                Icon = "code",
                SortOrder = order++,
                IsPublished = true
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedProductsAsync()
    {
        if (await _context.SoftwareProducts.AnyAsync())
            return;

        var products = new[]
        {
            "ECMS",
            "Warehouse Management System",
            "Transportation Management",
            "Inventory System",
            "HRMS",
            "Payroll",
            "CRM",
            "ERP",
            "Booking System",
            "Learning Management System",
            "Point of Sale",
            "Custom Enterprise Software",
        };

        var maxOrder = await _context.SoftwareProducts.MaxAsync(p => (int?)p.SortOrder) ?? 0;
        var order = maxOrder;

        foreach (var name in products)
        {
            var slug = SlugHelper.Generate(name);
            var exists = await _context.SoftwareProducts.AnyAsync(p => p.Slug == slug || (p.Name == name && !p.IsDeleted));
            if (exists) continue;

            order++;
            _context.SoftwareProducts.Add(new SoftwareProduct
            {
                Name = name,
                Slug = slug,
                ShortDescription = $"Enterprise {name.ToLowerInvariant()} solution tailored for your business.",
                SortOrder = order,
                IsPublished = true
            });
            await _context.SaveChangesAsync();
        }

        await EnsureFeaturedProductAsync();
    }

    private async Task EnsureFeaturedProductAsync()
    {
        var hasFeatured = await _context.SoftwareProducts.AnyAsync(p => !p.IsDeleted && p.IsFeatured);
        if (hasFeatured) return;

        var ecms = await _context.SoftwareProducts
            .FirstOrDefaultAsync(p => !p.IsDeleted && p.Slug == "ecms");
        if (ecms is null) return;

        ecms.IsFeatured = true;
        ecms.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    private async Task SeedIndustriesAsync()
    {
        if (await _context.Industries.AnyAsync())
            return;

        var industries = new[]
        {
            "Healthcare",
            "Finance & Banking",
            "Retail & E-Commerce",
            "Manufacturing",
            "Logistics & Transportation",
            "Education",
            "Government",
            "Real Estate",
            "Hospitality",
            "Energy & Utilities",
        };

        var maxOrder = await _context.Industries.MaxAsync(i => (int?)i.SortOrder) ?? 0;
        var order = maxOrder;

        foreach (var name in industries)
        {
            var slug = SlugHelper.Generate(name);
            var exists = await _context.Industries.AnyAsync(i => i.Slug == slug || (i.Name == name && !i.IsDeleted));
            if (exists) continue;

            order++;
            _context.Industries.Add(new Industry
            {
                Name = name,
                Slug = slug,
                ShortDescription =
                    $"We deliver specialized software solutions addressing the unique challenges of the {name.ToLowerInvariant()} sector — from compliance and security to operational efficiency.",
                SortOrder = order,
                IsPublished = true
            });
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedFaqAsync()
    {
        if (await _context.FaqItems.AnyAsync())
            return;

        var items = new (string Question, string Answer)[]
        {
            ("What industries does TRANS-NET serve?", "We serve healthcare, finance, retail, logistics, education, government, and many other sectors with tailored software solutions."),
            ("Do you offer custom software development?", "Yes. Custom software development is our core offering — from MVPs to enterprise-grade platforms."),
            ("What technologies do you use?", "We work with modern stacks including .NET, React, Node.js, cloud platforms (AWS, Azure), and mobile frameworks."),
            ("How long does a typical project take?", "Timelines vary by scope. Small projects may take 4–8 weeks; enterprise systems typically run 3–12 months."),
            ("Do you provide post-launch support?", "Absolutely. We offer maintenance plans, SLA-backed support, and continuous improvement services."),
        };

        var maxOrder = await _context.FaqItems.MaxAsync(f => (int?)f.SortOrder) ?? 0;
        var order = maxOrder;

        foreach (var (question, answer) in items)
        {
            var exists = await _context.FaqItems.AnyAsync(f => f.Question == question && !f.IsDeleted);
            if (exists) continue;

            order++;
            _context.FaqItems.Add(new FaqItem { Question = question, Answer = answer, SortOrder = order, IsPublished = true });
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedSiteStatsAsync()
    {
        if (await _context.SiteStats.AnyAsync())
            return;

        var items = new (string Value, string Label, string Icon)[]
        {
            ("50+", "Happy Clients", "users"),
            ("100+", "Projects Completed", "code"),
            ("5+", "Years of Experience", "award"),
            ("24/7", "Support & Maintenance", "headset"),
        };

        var maxOrder = await _context.SiteStats.MaxAsync(s => (int?)s.SortOrder) ?? 0;
        var order = maxOrder;

        foreach (var (value, label, icon) in items)
        {
            var exists = await _context.SiteStats.AnyAsync(s => s.Label == label && !s.IsDeleted);
            if (exists) continue;

            order++;
            _context.SiteStats.Add(new SiteStat { Value = value, Label = label, Icon = icon, SortOrder = order, IsPublished = true });
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedCompanyHighlightsAsync()
    {
        if (await _context.CompanyHighlights.AnyAsync())
            return;

        var items = new (string Title, string Description)[]
        {
            ("Enterprise Expertise", "Proven track record delivering scalable solutions for global organizations."),
            ("Agile Delivery", "Transparent, iterative development with regular demos and feedback loops."),
            ("Security First", "Built-in security practices, compliance awareness, and rigorous testing."),
            ("Dedicated Teams", "Experienced developers, designers, and project managers on every engagement."),
        };

        var maxOrder = await _context.CompanyHighlights.MaxAsync(h => (int?)h.SortOrder) ?? 0;
        var order = maxOrder;

        foreach (var (title, description) in items)
        {
            var exists = await _context.CompanyHighlights.AnyAsync(h => h.Title == title && !h.IsDeleted);
            if (exists) continue;

            order++;
            _context.CompanyHighlights.Add(new CompanyHighlight { Title = title, Description = description, SortOrder = order, IsPublished = true });
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedProcessStepsAsync()
    {
        if (await _context.ProcessSteps.AnyAsync())
            return;

        var items = new (string Step, string Title, string Description)[]
        {
            ("01", "Discovery", "We analyze your business goals, users, and technical requirements."),
            ("02", "Design", "UX/UI prototypes and architecture blueprints aligned to your vision."),
            ("03", "Development", "Agile sprints with continuous integration and transparent progress."),
            ("04", "Testing", "Rigorous QA, performance testing, and security validation."),
            ("05", "Deployment", "Production rollout with monitoring and DevOps best practices."),
            ("06", "Support", "Ongoing maintenance, updates, and dedicated support channels."),
        };

        var maxOrder = await _context.ProcessSteps.MaxAsync(p => (int?)p.SortOrder) ?? 0;
        var order = maxOrder;

        foreach (var (step, title, description) in items)
        {
            var exists = await _context.ProcessSteps.AnyAsync(p => p.StepLabel == step && !p.IsDeleted);
            if (exists) continue;

            order++;
            _context.ProcessSteps.Add(new ProcessStep { StepLabel = step, Title = title, Description = description, SortOrder = order, IsPublished = true });
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedTechnologiesAsync()
    {
        if (await _context.Technologies.AnyAsync())
            return;

        var technologies = new (string Name, string Category)[]
        {
            ("React", "Frontend"),
            ("TypeScript", "Frontend"),
            ("ASP.NET Core", "Backend"),
            ("PHP", "Backend"),
            ("Java", "Backend"),
            ("Symfony", "Backend"),
            ("Node.js", "Backend"),
            ("Python", "Backend"),
            ("MySQL", "Database"),
            ("Redis", "Infrastructure"),
            ("Docker", "Infrastructure"),
            ("AWS", "Cloud"),
            ("Azure", "Cloud"),
        };

        var maxOrder = await _context.Technologies.MaxAsync(t => (int?)t.SortOrder) ?? 0;
        var order = maxOrder;

        foreach (var (name, category) in technologies)
        {
            var exists = await _context.Technologies.AnyAsync(t => t.Name == name && !t.IsDeleted);
            if (exists) continue;

            order++;
            _context.Technologies.Add(new Technology
            {
                Name = name,
                Category = category,
                IconUrl = $"/uploads/icons/{SlugHelper.Generate(name)}.svg",
                SortOrder = order,
                IsPublished = true
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedClientsAsync()
    {
        if (await _context.Clients.AnyAsync())
            return;

        var clients = new (string Name, string Website)[]
        {
            ("MetroHealth Systems", "https://example.com"),
            ("Pacific Logistics Group", "https://example.com"),
            ("FinServe Holdings", "https://example.com"),
            ("EduCore Solutions", "https://example.com"),
            ("RetailOne Philippines", "https://example.com"),
            ("GovTech Partners", "https://example.com"),
            ("BuildRight Construction", "https://example.com"),
            ("Manila FinTech Co.", "https://example.com"),
        };

        foreach (var (name, website) in clients)
        {
            var exists = await _context.Clients.AnyAsync(c => c.Name == name && !c.IsDeleted);
            if (exists) continue;

            _context.Clients.Add(new Client
            {
                Name = name,
                Website = website,
                LogoUrl = string.Empty,
                IsPublished = true,
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedTestimonialsAsync()
    {
        if (await _context.Testimonials.AnyAsync())
            return;

        var items = new (string Name, string Company, string Quote, int SortOrder, int Rating)[]
        {
            (
                "Maria Santos",
                "MetroHealth Systems",
                "TRANS-NET delivered our patient management platform on schedule with clear communication throughout. Their team understood our compliance requirements from day one and stayed focused on outcomes.",
                1,
                5
            ),
            (
                "James Chen",
                "Pacific Logistics Group",
                "We needed a reliable partner to modernize our dispatch and tracking systems. TRANS-NET combined strong engineering with practical business understanding — the rollout was smooth and our teams adopted the new tools quickly.",
                2,
                5
            ),
            (
                "Angela Reyes",
                "FinServe Holdings",
                "From discovery to production support, TRANS-NET has been a dependable extension of our team. They deliver maintainable code, transparent progress, and software that performs when it matters most.",
                3,
                5
            ),
            (
                "David Okonkwo",
                "EduCore Solutions",
                "The web platform TRANS-NET built for us scales well and is easy to extend. Their process kept stakeholders aligned, and the quality of delivery exceeded our expectations.",
                4,
                5
            ),
        };

        foreach (var (name, company, quote, sortOrder, rating) in items)
        {
            var exists = await _context.Testimonials.AnyAsync(t => t.Name == name && t.Company == company && !t.IsDeleted);
            if (exists) continue;

            _context.Testimonials.Add(new Testimonial
            {
                Name = name,
                Company = company,
                Quote = quote,
                SortOrder = sortOrder,
                Rating = rating,
                AvatarUrl = string.Empty,
                IsPublished = true,
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedBlogsAsync()
    {
        if (await _context.Blogs.AnyAsync())
            return;

        var categoryName = "Insights";
        var categorySlug = "insights";

        var category = await _context.BlogCategories
            .FirstOrDefaultAsync(c => c.Slug == categorySlug && !c.IsDeleted);

        if (category is null)
        {
            category = new BlogCategory
            {
                Name = categoryName,
                Slug = categorySlug,
                IsPublished = true,
            };
            _context.BlogCategories.Add(category);
            await _context.SaveChangesAsync();
        }

        var posts = new (string Title, string Excerpt, string Content, int DaysAgo)[]
        {
            (
                "How to Choose the Right Custom Software Partner",
                "What to evaluate before you commit — from delivery model and technical depth to long-term support.",
                "<p>Selecting a software development partner is a strategic decision. Look beyond hourly rates: assess domain experience, communication practices, code quality standards, and how the team handles change after launch.</p><p>Strong partners document assumptions early, demo working software often, and plan for maintenance from the start.</p>",
                14
            ),
            (
                "Modernizing Legacy Systems Without Disrupting Operations",
                "A phased approach to upgrading critical systems while keeping the business running.",
                "<p>Legacy modernization works best in stages — identify bounded modules, introduce APIs or integration layers, and migrate users incrementally rather than betting on a single big-bang release.</p><p>Pair each phase with monitoring, rollback plans, and training so operations stay stable throughout the transition.</p>",
                10
            ),
            (
                "Building Mobile Apps That Integrate With Enterprise Systems",
                "Mobile experiences that connect securely to ERP, CRM, and internal APIs.",
                "<p>Enterprise mobile apps succeed when authentication, offline behavior, and API contracts are designed together. Plan for role-based access, audit trails, and performance on real devices in the field.</p><p>Invest in a maintainable architecture so new features ship without rewriting the foundation.</p>",
                7
            ),
            (
                "Why Dedicated Development Teams Outpace Project-Based Outsourcing",
                "Continuity, context, and velocity — when an embedded team is the better model.",
                "<p>Dedicated teams accumulate product knowledge, reduce handoff overhead, and align with your roadmap over quarters — not just sprints. The model fits organizations that need ongoing delivery, not a one-off build.</p><p>Clear goals, shared tooling, and regular retrospectives keep the partnership productive.</p>",
                3
            ),
        };

        foreach (var (title, excerpt, content, daysAgo) in posts)
        {
            var slug = SlugHelper.Generate(title);
            var exists = await _context.Blogs.AnyAsync(b => b.Slug == slug && !b.IsDeleted);
            if (exists) continue;

            _context.Blogs.Add(new Blog
            {
                Title = title,
                Slug = slug,
                Excerpt = excerpt,
                Content = content,
                CategoryId = category.Id,
                PublishedAt = DateTime.UtcNow.AddDays(-daysAgo),
                SeoTitle = title,
                SeoDescription = excerpt,
                IsPublished = true,
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedMissingIntroLabelsAsync()
    {
        var extras = new (string Key, string Value, string Group)[]
        {
            ("home_intro_eyebrow", "What we do", "home"),
            ("home_intro_story_label", "Our story", "home"),
            ("home_intro_services_label", "All services", "home"),
        };

        foreach (var (key, value, group) in extras)
        {
            var exists = await _context.SiteSettings.AnyAsync(s => s.Key == key);
            if (exists) continue;

            _context.SiteSettings.Add(new SiteSetting
            {
                Key = key,
                Value = value,
                Group = group,
                IsPublic = true,
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedMissingServicesPageSettingsAsync()
    {
        var extras = new (string Key, string Value, string Group)[]
        {
            ("services_page_highlight", "Periodic check-up of components and parts", "pages"),
            ("services_page_image", "/uploads/pages/service-01.jpg", "pages"),
            ("services_page_image_2", "/uploads/pages/service-02.png", "pages"),
            ("services_cta_label", "Request a quote", "pages"),
            ("services_cta_title", "Need service for your equipment?", "pages"),
            ("services_cta_subtitle", "Tell us the building, the brand, and what needs attention — we will help you plan the right maintenance path.", "pages"),
            ("services_related_eyebrow", "Also available", "pages"),
            ("services_related_title", "Other services", "pages"),
        };

        foreach (var (key, value, group) in extras)
        {
            var exists = await _context.SiteSettings.AnyAsync(s => s.Key == key);
            if (exists) continue;

            _context.SiteSettings.Add(new SiteSetting
            {
                Key = key,
                Value = value,
                Group = group,
                IsPublic = true,
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedMissingAboutPageSettingsAsync()
    {
        var extras = new (string Key, string Value, string Group)[]
        {
            ("about_values_eyebrow", "Core values", "about"),
            ("about_values_title", "How we work", "about"),
            ("about_values", "Integrity\nDiscipline\nEfficiency\nAccountability", "about"),
            ("about_assessment_title", "Free assessment and consultation", "about"),
            ("about_assessment_body", "For existing equipment and new inquiries within Metro Manila, Mega Manila, and nearby cities.", "about"),
            ("about_controls_note", "Our technical team works with Monarch, Step, Fusion/Nidec/Kinitek, Fuji Sunrise, SJ Siemens, SM Series, BL, Yaskawa, Variespeed, Panasonic, Ningbo, Flying, Selcom, and other common controls. Most elevator companies carry different brand names but often use the same type of control system.", "about"),
            ("about_story_image_2", "/uploads/pages/about-us-02.png", "about"),
            ("about_story_image_3", "/uploads/pages/about-us-03.png", "about"),
        };

        foreach (var (key, value, group) in extras)
        {
            var exists = await _context.SiteSettings.AnyAsync(s => s.Key == key);
            if (exists) continue;

            _context.SiteSettings.Add(new SiteSetting
            {
                Key = key,
                Value = value,
                Group = group,
                IsPublic = true,
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedSiteSettingsAsync()
    {
        var settings = new (string Key, string Value, string Group, bool IsPublic)[]
        {
            ("company_name", "DREAM", "general", true),
            ("company_logo", "", "branding", true),
            ("company_logo_media", "png", "branding", true),
            ("company_tagline", "Elevator & Escalator Corp.", "branding", true),
            ("header_style", "navy", "branding", true),
            ("header_bg_color", "#0a1a2e", "branding", true),
            ("company_email", "info@trans-net.com", "contact", true),
            ("email_provider", "hostinger_api", "email", false),
            ("hostinger_mail_api_token", "", "email", false),
            ("smtp_host", "smtp.hostinger.com", "email", false),
            ("smtp_port", "465", "email", false),
            ("smtp_username", "", "email", false),
            ("smtp_password", "", "email", false),
            ("smtp_enable_ssl", "true", "email", false),
            ("company_phone", "+1-800-TRANS-NET", "contact", true),
            ("company_email_alt", "dreamelevator@myyahoo.com", "contact", true),
            ("company_mobiles", "0927 612 6421\n0933 856 0622\n0991 341 0811", "contact", true),
            ("company_address", "Metro Manila, Philippines", "contact", true),
            ("footer_text", "Custom software development for businesses that need reliable delivery and a long-term development partner.", "general", true),
            ("social_facebook", "https://facebook.com/transnet", "social", true),
            ("social_linkedin", "https://linkedin.com/company/transnet", "social", true),
            ("social_facebook_enabled", "true", "social", true),
            ("social_linkedin_enabled", "true", "social", true),
            ("social_whatsapp_enabled", "true", "social", true),
            ("hero_tagline", "WE DESIGN. WE DEVELOP. WE DELIVER.", "home", true),
            ("hero_agency_label", "Enterprise software development", "home", true),
            ("hero_theme_preset", "light", "home", true),
            ("hero_image_overlay", "85", "home", true),
            ("hero_overlay_color", "#f8fafc", "home", true),
            ("hero_layout_mode", "static", "home", true),
            ("hero_carousel_interval", "7", "home", true),
            ("hero_carousel_autoplay", "true", "home", true),
            ("hero_carousel_show_panel", "true", "home", true),
            ("hero_title_line1", "Driven by engineering,", "home", true),
            ("hero_title_highlight", "empowered by people", "home", true),
            ("company_established", "Est. 2010", "home", true),
            ("company_hq_label", "Global delivery", "home", true),
            ("home_intro_eyebrow", "What we do", "home", true),
            ("home_intro_story_label", "Our story", "home", true),
            ("home_intro_services_label", "All services", "home", true),
            ("home_intro_line1", "A software partner focused on", "home", true),
            ("home_intro_line2", "delivering value", "home", true),
            ("home_intro_line3", "", "home", true),
            ("home_intro_body", "TRANS-NET helps businesses turn complex requirements into reliable software products. We work as an extension of your team, with clear communication, proven processes, and outcomes you can measure.", "home", true),
            ("now_building_items", "Enterprise HRMS,Customer Portal,Mobile App v2,Reporting Dashboard", "home", true),
            ("hero_description", "We turn software into business value by delivering domain expertise, modern engineering, and dependable delivery that helps organizations grow — in any market environment.", "home", true),
            ("hero_highlights_enabled", "true", "home", true),
            ("hero_highlights", "Custom software development|Build reliable enterprise applications and digital products tailored to how your teams and customers actually work.|/services;;Web & mobile applications|Design and deliver responsive web platforms and mobile apps with clear UX, solid architecture, and maintainable code.|/services;;Dedicated development teams|Scale delivery with engineers who integrate into your workflow, communicate clearly, and stay focused on outcomes.|/contact", "home", true),
            ("hero_panel_eyebrow", "Software solutions", "home", true),
            ("hero_panel_title", "Want software built for how your business actually works?", "home", true),
            ("hero_panel_body", "TRANS-NET is a software development company. We design and build custom applications that streamline operations, connect your teams, and support growth — from enterprise systems to web and mobile products.", "home", true),
            ("hero_panel_points", "Custom enterprise software,Web & mobile applications,System integration & APIs,Ongoing support & maintenance", "home", true),
            ("company_website", "www.trans-net.com", "contact", true),
            ("about_intro", "TRANS-NET is a software development company specializing in custom enterprise applications, web and mobile products, and long-term software support.", "about", true),
            ("about_secondary", "With over a decade of experience, we have helped organizations across healthcare, finance, logistics, and more achieve their technology goals through innovative, scalable software. Our path has been shaped by the same challenges our clients face — evolving requirements, new markets, and the need to integrate modern tools without disrupting operations.", "about", true),
            ("about_page_eyebrow", "Who we are", "about", true),
            ("about_page_title", "Delivering software expertise and results", "about", true),
            ("about_page_subtitle", "For over a decade, we have been a software development partner driven by engineering and empowered by people — building custom applications that create lasting business impact.", "about", true),
            ("about_mission", "Deliver reliable, scalable custom software that solves real business problems and creates lasting value for every client we serve.", "about", true),
            ("about_vision", "Be the technology partner organizations trust for innovation, quality engineering, and long-term growth.", "about", true),
            ("about_mission_image_position", "right", "about", true),
            ("about_vision_image_position", "left", "about", true),
            ("about_mission_image", "", "about", true),
            ("about_vision_image", "", "about", true),
            ("about_story_eyebrow", "Our story", "about", true),
            ("about_story_title", "From focused software studio to trusted development partner", "about", true),
            ("about_stats_title", "The support you need, for results you want", "about", true),
            ("privacy_content", "<p>Last updated: June 2026</p><h2>Information We Collect</h2><p>We collect information you provide directly, such as when you fill out our contact form, subscribe to our newsletter, or apply for a career opportunity.</p><h2>How We Use Your Information</h2><p>We use collected information to respond to inquiries, provide services, improve our website, and communicate with you about our offerings.</p><h2>Data Security</h2><p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.</p><h2>Contact</h2><p>For privacy-related inquiries, contact us at privacy@trans-net.com.</p>", "legal", true),
            ("terms_content", "<p>Last updated: June 2026</p><h2>Terms of Use</h2><p>By accessing this website, you agree to be bound by these terms and conditions.</p><h2>Services</h2><p>TRANS-NET provides software development and consulting services as described on this website.</p><h2>Contact</h2><p>For questions about these terms, contact legal@trans-net.com.</p>", "legal", true),
            ("home_stats_eyebrow", "Results", "home", true),
            ("home_stats_title", "Outcomes we deliver", "home", true),
            ("home_stats_subtitle", "Measurable impact from software built with clarity, quality, and long-term partnership.", "home", true),
            ("home_services_eyebrow", "Our Services", "home", true),
            ("home_services_title", "End-to-end solutions for modern businesses", "home", true),
            ("home_services_subtitle", "From discovery workshops to production deployment and ongoing optimization — we cover the full software lifecycle.", "home", true),
            ("home_clients_eyebrow", "Trusted By", "home", true),
            ("home_clients_title", "Companies That Trust Us", "home", true),
            ("home_clients_subtitle", "Partnering with leading organizations across industries.", "home", true),
            ("home_technologies_eyebrow", "Technologies", "home", true),
            ("home_technologies_title", "Modern Tech Stack", "home", true),
            ("home_technologies_subtitle", "From frontend to backend — we choose reliable, maintainable tools for every layer of your software.", "home", true),
            ("home_featured_product_eyebrow", "Featured product", "home", true),
            ("home_featured_product_title", "Software built for real operations", "home", true),
            ("home_featured_product_subtitle", "Explore our flagship solution — designed for teams that need reliability, visibility, and scale.", "home", true),
            ("home_featured_product_theme_preset", "light", "home", true),
            ("home_products_eyebrow", "Products", "home", true),
            ("home_products_title", "Software Solutions", "home", true),
            ("home_products_subtitle", "Ready-to-deploy and customizable enterprise software products.", "home", true),
            ("home_industries_eyebrow", "Industries", "home", true),
            ("home_industries_title", "Sector Expertise", "home", true),
            ("home_industries_subtitle", "Deep domain knowledge across diverse industries.", "home", true),
            ("home_why_eyebrow", "Why TRANS-NET", "home", true),
            ("home_why_title", "Why Choose Us", "home", true),
            ("home_why_subtitle", "We combine technical excellence with business understanding.", "home", true),
            ("home_process_eyebrow", "Process", "home", true),
            ("home_process_title", "Our Development Process", "home", true),
            ("home_process_subtitle", "A proven methodology for delivering successful projects on time and on budget.", "home", true),
            ("home_portfolio_eyebrow", "Portfolio", "home", true),
            ("home_portfolio_title", "Proven results across industries", "home", true),
            ("home_portfolio_subtitle", "Explore how we help organizations solve complex challenges with custom software, web platforms, and mobile applications.", "home", true),
            ("home_testimonials_eyebrow", "Testimonials", "home", true),
            ("home_testimonials_title", "What Our Clients Say", "home", true),
            ("home_testimonials_subtitle", "Trusted by businesses worldwide for delivering exceptional results.", "home", true),
            ("home_faq_eyebrow", "FAQ", "home", true),
            ("home_faq_title", "Frequently Asked Questions", "home", true),
            ("home_faq_subtitle", "Find answers to common questions about our services and process.", "home", true),
            ("home_blog_eyebrow", "Blog", "home", true),
            ("home_blog_title", "Latest Articles", "home", true),
            ("home_blog_subtitle", "Insights, trends, and best practices from our team.", "home", true),
            ("home_cta_title", "Ready to build your next software solution?", "home", true),
            ("home_cta_subtitle", "Let's discuss how TRANS-NET can help you plan, build, and maintain software that fits your business.", "home", true),
            ("home_cta_primary_label", "Get Started", "home", true),
            ("home_cta_secondary_label", "Explore Services", "home", true),
            ("contact_page_title", "Contact Us", "pages", true),
            ("contact_page_subtitle", "We'd love to hear about your project — tell us your goals and we'll help you plan the right path forward.", "pages", true),
            ("contact_response_promise", "We typically respond within one business day.", "contact", true),
            ("contact_main_eyebrow", "Contact details", "contact", true),
            ("contact_main_title", "Let's start a conversation", "contact", true),
            ("contact_main_subtitle", "Whether you need a product demo, custom development, or ongoing support — reach out and we'll connect you with the right team.", "contact", true),
            ("contact_form_title", "Send us a message", "contact", true),
            ("contact_form_subtitle", "Fill out the form and our team will get back to you within one business day.", "contact", true),
            ("contact_expect_eyebrow", "What happens next", "contact", true),
            ("contact_expect_title", "A clear path from first message to next steps", "contact", true),
            ("contact_expect_subtitle", "We keep the process straightforward so you know what to expect after reaching out.", "contact", true),
            ("contact_expect_step1_title", "Send your message", "contact", true),
            ("contact_expect_step1_text", "Tell us about your project, timeline, and goals — the more context, the better we can help.", "contact", true),
            ("contact_expect_step2_title", "We review & respond", "contact", true),
            ("contact_expect_step2_text", "A solutions consultant reviews your inquiry and replies within one business day.", "contact", true),
            ("contact_expect_step3_title", "Plan next steps", "contact", true),
            ("contact_expect_step3_text", "We'll schedule a call to scope requirements and recommend the best path forward.", "contact", true),
            ("contact_faq_eyebrow", "FAQ", "contact", true),
            ("contact_faq_title", "Common questions before you reach out", "contact", true),
            ("contact_faq_subtitle", "Quick answers about engagement models, timelines, and how we work with new clients.", "contact", true),
            ("contact_map_eyebrow", "Visit us", "contact", true),
            ("contact_map_title", "Find our office", "contact", true),
            ("contact_map_subtitle", "Drop by during business hours or use the map for directions.", "contact", true),
            ("contact_map_embed_url", "", "contact", true),
            ("contact_office_hours_title", "Office hours", "contact", true),
            ("contact_office_hours", "Mon–Fri|9:00 AM – 6:00 PM (PHT)\nSat–Sun|Closed", "contact", true),
            ("contact_office_hours_note", "Times shown in Philippines Standard Time (PHT).", "contact", true),
            ("contact_careers_eyebrow", "Join our team", "contact", true),
            ("contact_careers_title", "Build enterprise software with us", "contact", true),
            ("contact_careers_subtitle", "We're always looking for engineers, designers, and consultants who care about quality delivery and long-term partnerships.", "contact", true),
            ("contact_careers_primary_label", "View open roles", "contact", true),
            ("contact_careers_secondary_label", "Send an inquiry", "contact", true),
            ("contact_hero_dark_bg", "true", "sections", true),
            ("contact_map_dark_bg", "false", "sections", true),
            ("contact_expect_dark_bg", "true", "sections", true),
            ("contact_careers_dark_bg", "true", "sections", true),
            ("contact_faq_dark_bg", "false", "sections", true),
            ("contact_main_enabled", "true", "contact", true),
            ("contact_map_enabled", "true", "contact", true),
            ("contact_expect_enabled", "true", "contact", true),
            ("contact_careers_enabled", "true", "contact", true),
            ("contact_faq_enabled", "true", "contact", true),
            ("careers_page_title", "Careers", "pages", true),
            ("careers_page_subtitle", "Build the future of enterprise software with us.", "pages", true),
            ("blog_page_title", "Blog", "pages", true),
            ("blog_page_subtitle", "Insights, trends, and best practices.", "pages", true),
            ("industries_page_title", "Industries We Serve", "pages", true),
            ("industries_page_subtitle", "Domain expertise across diverse sectors.", "pages", true),
            ("services_page_title", "Service & Maintenance", "pages", true),
            ("services_page_subtitle", "Affordable, quality maintenance for all types and brands of elevators, escalators, and related equipment.", "pages", true),
            ("services_page_highlight", "Periodic check-up of components and parts", "pages", true),
            ("services_page_image", "/uploads/pages/service-01.jpg", "pages", true),
            ("services_page_image_2", "/uploads/pages/service-02.png", "pages", true),
            ("services_cta_label", "Request a quote", "pages", true),
            ("services_cta_title", "Need service for your equipment?", "pages", true),
            ("services_cta_subtitle", "Tell us the building, the brand, and what needs attention — we will help you plan the right maintenance path.", "pages", true),
            ("services_related_eyebrow", "Also available", "pages", true),
            ("services_related_title", "Other services", "pages", true),
            ("services_section_eyebrow", "What we do", "pages", true),
            ("services_section_title", "Elevators, escalators, and complete support", "pages", true),
            ("services_section_subtitle", "Supply, installation, modernization, maintenance, parts, and structural shafts — tailored to each building.", "pages", true),
            ("about_industries_eyebrow", "Industries", "about", true),
            ("about_industries_title", "Sector Expertise", "about", true),
            ("about_industries_subtitle", "Deep domain knowledge across diverse industries — from healthcare to logistics.", "about", true),
            ("about_products_promo_eyebrow", "Software products", "about", true),
            ("about_products_promo_title", "Enterprise Software Products", "about", true),
            ("about_products_promo_subtitle", "Ready-to-deploy and customizable solutions built for real-world operations — from document management to industry-specific platforms.", "about", true),
            ("products_page_eyebrow", "Software products", "products", true),
            ("products_page_title", "Enterprise Software Products", "products", true),
            ("products_page_subtitle", "Ready-to-deploy and customizable solutions built for real-world operations — from document management to industry-specific platforms.", "products", true),
            ("products_featured_eyebrow", "Featured product", "products", true),
            ("products_featured_title", "Our flagship solution", "products", true),
            ("products_featured_subtitle", "Purpose-built software for teams that need reliability, visibility, and scale in daily operations.", "products", true),
            ("products_catalog_eyebrow", "Product catalog", "products", true),
            ("products_catalog_title", "All software solutions", "products", true),
            ("products_catalog_subtitle", "Browse our full suite of enterprise products — each customizable to your workflows and integration needs.", "products", true),
            ("products_cta_title", "Need a custom demo or deployment?", "products", true),
            ("products_cta_subtitle", "Our team can tailor any product to your workflows, integrate with existing systems, and support you through production rollout and beyond.", "products", true),
            ("products_cta_primary_label", "Request a demo", "products", true),
            ("products_cta_secondary_label", "Explore services", "products", true),
            ("products_hero_dark_bg", "true", "sections", true),
            ("products_featured_dark_bg", "false", "sections", true),
            ("products_featured_theme_preset", "light", "products", true),
            ("products_catalog_dark_bg", "false", "sections", true),
            ("products_cta_dark_bg", "false", "sections", true),
            ("products_featured_enabled", "true", "products", true),
            ("products_catalog_enabled", "true", "products", true),
            ("products_cta_enabled", "true", "products", true),
            ("home_services_enabled", "true", "home", true),
            ("home_intro_enabled", "true", "home", true),
            ("home_stats_enabled", "true", "home", true),
            ("home_clients_enabled", "true", "home", true),
            ("home_technologies_enabled", "true", "home", true),
            ("home_featured_product_enabled", "true", "home", true),
            ("home_products_enabled", "true", "home", true),
            ("home_industries_enabled", "true", "home", true),
            ("home_why_enabled", "true", "home", true),
            ("home_process_enabled", "true", "home", true),
            ("home_portfolio_enabled", "true", "home", true),
            ("home_testimonials_enabled", "true", "home", true),
            ("home_faq_enabled", "true", "home", true),
            ("home_blog_enabled", "true", "home", true),
            ("home_cta_enabled", "true", "home", true),
            ("about_cta_title", "We'd love to hear from you", "about", true),
            ("about_cta_subtitle", "Tell us about your project — we'll get back to you as soon as possible.", "about", true),
            ("about_why_eyebrow", "What we do", "about", true),
            ("about_why_title", "We help companies build better software", "about", true),
            ("about_why_subtitle", "Custom development, dedicated teams, and long-term support tailored to your goals.", "about", true),
            ("about_process_eyebrow", "Process", "about", true),
            ("about_process_title", "Our Development Process", "about", true),
            ("about_process_subtitle", "A proven methodology for delivering successful projects on time and on budget.", "about", true),
            ("about_hero_dark_bg", "false", "sections", true),
            ("about_mission_enabled", "true", "about", true),
            ("about_vision_enabled", "true", "about", true),
            ("about_story_enabled", "true", "about", true),
            ("about_stats_bar_enabled", "true", "about", true),
            ("about_stats_enabled", "true", "about", true),
            ("about_why_enabled", "true", "about", true),
            ("about_process_enabled", "true", "about", true),
            ("about_industries_enabled", "true", "about", true),
            ("about_products_promo_enabled", "true", "about", true),
            ("about_cta_enabled", "true", "about", true),
            ("home_intro_dark_bg", "false", "sections", true),
            ("home_stats_dark_bg", "false", "sections", true),
            ("home_services_dark_bg", "false", "sections", true),
            ("home_portfolio_dark_bg", "false", "sections", true),
            ("home_clients_dark_bg", "false", "sections", true),
            ("home_technologies_dark_bg", "false", "sections", true),
            ("home_featured_product_dark_bg", "false", "sections", true),
            ("home_products_dark_bg", "false", "sections", true),
            ("home_industries_dark_bg", "false", "sections", true),
            ("home_why_dark_bg", "false", "sections", true),
            ("home_process_dark_bg", "false", "sections", true),
            ("home_testimonials_dark_bg", "false", "sections", true),
            ("home_faq_dark_bg", "false", "sections", true),
            ("home_blog_dark_bg", "false", "sections", true),
            ("home_cta_dark_bg", "false", "sections", true),
            ("about_mission_dark_bg", "false", "sections", true),
            ("about_vision_dark_bg", "false", "sections", true),
            ("about_story_dark_bg", "false", "sections", true),
            ("about_stats_dark_bg", "false", "sections", true),
            ("about_why_dark_bg", "false", "sections", true),
            ("about_process_dark_bg", "false", "sections", true),
            ("about_industries_dark_bg", "false", "sections", true),
            ("about_products_promo_dark_bg", "true", "sections", true),
            ("about_cta_dark_bg", "false", "sections", true),
            ("services_stats_dark_bg", "false", "sections", true),
            ("services_list_dark_bg", "false", "sections", true),
            ("services_how_we_work_dark_bg", "true", "sections", true),
            ("services_cta_dark_bg", "false", "sections", true),
            ("technologies_stats_dark_bg", "false", "sections", true),
            ("technologies_stack_dark_bg", "false", "sections", true),
            ("technologies_why_dark_bg", "true", "sections", true),
            ("technologies_cta_dark_bg", "false", "sections", true),
            ("portfolio_list_dark_bg", "false", "sections", true),
            ("industries_list_dark_bg", "false", "sections", true),
            ("contact_main_dark_bg", "false", "sections", true),
            ("gallery_list_dark_bg", "false", "sections", true),
            ("clients_list_dark_bg", "false", "sections", true),
            ("gallery_page_title", "Gallery", "pages", true),
            ("gallery_page_subtitle", "Jobsite photos from installation, modernization, and service work across residential and commercial buildings.", "pages", true),
            ("clients_page_title", "Our valued clients", "pages", true),
            ("clients_page_subtitle", "Buildings and facilities we are proud to serve.", "pages", true),
        };

        foreach (var (key, value, group, isPublic) in settings)
        {
            var existing = await _context.SiteSettings.FirstOrDefaultAsync(s => s.Key == key);
            if (existing is null)
            {
                _context.SiteSettings.Add(new SiteSetting
                {
                    Key = key,
                    Value = value,
                    Group = group,
                    IsPublic = isPublic
                });
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedSeoSettingsAsync()
    {
        if (await _context.SeoSettings.AnyAsync())
            return;

        var pages = new (string PageKey, string Title, string Description)[]
        {
            ("home", "DREAM | Elevator & Escalator Corp.", "DREAM — Elevator & Escalator Corp."),
            ("about", "About DREAM", "Learn about DREAM's mission, team, and expertise."),
            ("services", "Our Services | DREAM", "Explore DREAM elevator and escalator services."),
            ("products", "Products | DREAM", "Elevator and escalator products from DREAM."),
            ("portfolio", "Portfolio | DREAM", "View DREAM project portfolio and case studies."),
            ("industries", "Industries | DREAM", "Industries we serve with tailored elevator and escalator solutions."),
            ("contact", "Contact DREAM", "Get in touch with DREAM for your elevator and escalator needs."),
            ("careers", "Careers at DREAM", "Join DREAM and build reliable vertical transportation solutions.")
        };

        foreach (var (pageKey, title, description) in pages)
        {
            _context.SeoSettings.Add(new SeoSetting
            {
                PageKey = pageKey,
                Title = title,
                Description = description,
                Keywords = "elevator, escalator, DREAM",
                OgImage = "/uploads/og-default.jpg",
                IsPublished = true
            });
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedMissingSeoPagesAsync()
    {
        var pages = new (string PageKey, string Title, string Description)[]
        {
            ("products", "Products | DREAM", "Elevator and escalator products from DREAM."),
            ("technologies", "Technologies | DREAM", "Technology and systems used by DREAM."),
            ("blog", "Blog | DREAM", "Latest articles and insights from DREAM."),
            ("privacy", "Privacy Policy | DREAM", "DREAM privacy policy."),
            ("terms", "Terms & Conditions | DREAM", "DREAM terms and conditions."),
            ("gallery", "Gallery | DREAM", "Jobsite photos from elevator and escalator installation, modernization, and service work."),
            ("clients", "Our Valued Clients | DREAM", "Buildings and facilities served by DREAM Elevator & Escalator Corp."),
        };

        foreach (var (pageKey, title, description) in pages)
        {
            var exists = await _context.SeoSettings.AnyAsync(s => s.PageKey == pageKey);
            if (exists) continue;

            _context.SeoSettings.Add(new SeoSetting
            {
                PageKey = pageKey,
                Title = title,
                Description = description,
                Keywords = "elevator, escalator, DREAM",
                OgImage = "/uploads/og-default.jpg",
                IsPublished = true
            });
            await _context.SaveChangesAsync();
        }
    }

    private async Task SeedMissingInventoryPermissionsAsync()
    {
        const string module = "InventoryParts";
        var added = 0;
        foreach (var suffix in new[] { "Read", "Write" })
        {
            var name = $"{module}.{suffix}";
            if (await _context.Permissions.AnyAsync(p => p.Name == name))
                continue;

            _context.Permissions.Add(new Permission { Name = name, Module = module });
            added++;
        }

        if (added == 0)
            return;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Added {Count} inventory permission(s)", added);
    }

    private async Task SeedInventoryPartsIfEmptyAsync()
    {
        if (await _context.InventoryParts.AnyAsync())
            return;

        foreach (var row in InventoryPartSeedRows.All)
        {
            DateTime? purchasedAt = null;
            if (!string.IsNullOrWhiteSpace(row.PurchasedAt) && DateTime.TryParse(row.PurchasedAt, out var parsed))
                purchasedAt = DateTime.SpecifyKind(parsed.Date, DateTimeKind.Utc);

            _context.InventoryParts.Add(new InventoryPart
            {
                PurchasedAt = purchasedAt,
                Supplier = row.Supplier,
                Item = row.Item,
                Specification = row.Specification,
                Quantity = row.Quantity,
                UnitPrice = row.UnitPrice,
                TotalPrice = row.TotalPrice,
                AmountInPeso = row.AmountInPeso,
                ProjectBuilding = row.ProjectBuilding,
                LineKind = row.LineKind,
                Currency = "USD",
                SortOrder = row.SortOrder,
                IsPublished = true
            });
        }

        await _context.SaveChangesAsync();
        _logger.LogInformation("Seeded {Count} inventory lines from the parts register", InventoryPartSeedRows.All.Count);
    }
}
