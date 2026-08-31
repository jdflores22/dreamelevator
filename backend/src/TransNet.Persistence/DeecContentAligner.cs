using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Domain.Entities;

namespace TransNet.Persistence;

/// <summary>
/// One-time alignment of CMS copy and catalogs to DREAM Elevator &amp; Escalator Corp.
/// Source: https://dreamelevatorandescalator.com/
/// </summary>
internal static class DeecContentAligner
{
    public const string PackKey = "content_pack";
    public const string PackVersion = "deec-v2";
    private const string PackV1 = "deec-v1";

    public static async Task ApplyAsync(ApplicationDbContext context)
    {
        var pack = await context.SiteSettings.FirstOrDefaultAsync(s => s.Key == PackKey);
        if (pack is not null)
            return;

        await using var tx = await context.Database.BeginTransactionAsync();

        var current = pack?.Value;
        if (current != PackV1)
        {
            await UpsertSettingsAsync(context, Settings());
            await ReplaceServicesAsync(context);
            await ReplaceProductsAsync(context);
            await ReplaceIndustriesAsync(context);
            await ReplaceFaqAsync(context);
            await ReplaceStatsAsync(context);
            await ReplaceHighlightsAsync(context);
            await ReplaceProcessAsync(context);
            await ReplaceClientsAsync(context);
            await UnpublishSoftwareLeftoversAsync(context);
            await AlignSeoAsync(context);
        }

        await ApplyV2AdditiveAsync(context);

        if (pack is null)
        {
            context.SiteSettings.Add(new SiteSetting
            {
                Key = PackKey,
                Value = PackVersion,
                Group = "system",
                IsPublic = false,
            });
        }
        else
        {
            pack.Value = PackVersion;
            pack.UpdatedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();
        await tx.CommitAsync();
    }

    private static async Task ApplyV2AdditiveAsync(ApplicationDbContext context)
    {
        await ReplaceClientsAsync(context);
        await UpsertSettingsAsync(context, V2Settings());
        await EnsureSeoPageAsync(
            context,
            "gallery",
            "Gallery | DREAM",
            "Jobsite photos from elevator and escalator installation, modernization, and service work.");
        await EnsureSeoPageAsync(
            context,
            "clients",
            "Our Valued Clients | DREAM",
            "Buildings and facilities served by DREAM Elevator & Escalator Corp.");
    }

    private static async Task EnsureSeoPageAsync(
        ApplicationDbContext context,
        string pageKey,
        string title,
        string description)
    {
        var row = await context.SeoSettings.FirstOrDefaultAsync(s => s.PageKey == pageKey);
        if (row is null)
        {
            context.SeoSettings.Add(new SeoSetting
            {
                PageKey = pageKey,
                Title = title,
                Description = description,
                Keywords = "elevator, escalator, maintenance, modernization, Las Piñas, DREAM",
                OgImage = "/uploads/og-default.jpg",
                IsPublished = true,
            });
        }
        else
        {
            row.Title = title;
            row.Description = description;
            row.IsPublished = true;
            row.UpdatedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();
    }

    private static async Task UpsertSettingsAsync(
        ApplicationDbContext context,
        (string Key, string Value, string Group, bool IsPublic)[] settings)
    {
        var keys = settings.Select(s => s.Key).ToList();
        var existing = await context.SiteSettings.Where(s => keys.Contains(s.Key)).ToListAsync();
        var byKey = existing.ToDictionary(s => s.Key, StringComparer.Ordinal);

        foreach (var (key, value, group, isPublic) in settings)
        {
            if (byKey.TryGetValue(key, out var row))
            {
                if (ShouldPreserve(key, row.Value))
                    continue;

                row.Value = value;
                row.Group = group;
                row.IsPublic = isPublic;
                row.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                context.SiteSettings.Add(new SiteSetting
                {
                    Key = key,
                    Value = value,
                    Group = group,
                    IsPublic = isPublic,
                });
            }
        }

        await context.SaveChangesAsync();
    }

    private static bool ShouldPreserve(string key, string current)
    {
        if (string.IsNullOrWhiteSpace(current))
            return false;

        if (key == "company_logo" && current.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
            return true;

        if (key is "gallery_images" or "gallery_hero_image")
            return current.Contains("/uploads/", StringComparison.OrdinalIgnoreCase);

        if (key is "company_name" or "company_tagline")
        {
            return !current.Contains("TRANS-NET", StringComparison.OrdinalIgnoreCase)
                && !current.Contains("Software Development", StringComparison.OrdinalIgnoreCase);
        }

        return false;
    }

    private static async Task ReplaceServicesAsync(ApplicationDbContext context)
    {
        var current = await context.Services.Where(s => !s.IsDeleted).ToListAsync();
        foreach (var item in current)
        {
            item.IsDeleted = true;
            item.IsPublished = false;
            item.Slug = $"{item.Slug}-archived-{item.Id:N}"[..Math.Min(80, $"{item.Slug}-archived-{item.Id:N}".Length)];
            item.UpdatedAt = DateTime.UtcNow;
        }

        var items = new (string Title, string Short, string Long, string Icon)[]
        {
            (
                "Elevators",
                "MRL and SMR systems for passenger, freight, scenic, hospital, home, and accessibility lifts.",
                "<p>Machine Room Less (MRL) and Small Machine Room (SMR) designs reduce machinery space while keeping the installation efficient and architecturally clean.</p><p>We supply and install passenger lifts, freight elevators, scenic lifts, hospital bed lifts, home and villa lifts, dumbwaiters, cargo lifts (traction or hydraulic), wheelchair lifts, and scissor lifts.</p>",
                "building"
            ),
            (
                "Escalators & Moving Walkways",
                "Standard escalators, walkalators, moving walkways, and stair lifts for PWD and senior citizens.",
                "<p>We supply and install standard escalators, walkalators, moving walkways, and stair lifts designed for convenience, accessibility, and reliable daily use.</p>",
                "moving"
            ),
            (
                "Control System Modernization",
                "Reliable control upgrades for old or faulty equipment — efficient, easier to maintain, and lower in power use.",
                "<p>For aging or frequently faulty elevators, control-system modernization is the practical solution. Our integrated controls are compatible with other elevator brands, faster to install, easier to maintain, and use less electricity than non-integrated systems.</p><p>Our technical team works with Monarch, Step, Fusion/Nidec/Kinitek, Fuji Sunrise, SJ Siemens, SM Series, BL, Yaskawa, Variespeed, Panasonic, Ningbo, Flying, Selcom, and other common controls in the market.</p>",
                "cog"
            ),
            (
                "Service & Maintenance",
                "Affordable, quality maintenance for all types and brands of elevators, escalators, and related equipment.",
                "<p>We provide maintenance and support for all brands and types of equipment, including periodic inspection of components and parts.</p>",
                "wrench"
            ),
            (
                "Consultation, Parts & Structural Works",
                "Free assessment, importation, installation-only jobs, parts supply, and structural shafts for buildings without an existing hoistway.",
                "<p>We also offer importation, installation only, consultation and assessment, supply of parts, door panels and operators, and structural supply and installation for buildings without an existing elevator shaft.</p><p>Free assessment and consultation is available for existing equipment and new inquiries within Metro Manila, Mega Manila, and nearby cities.</p>",
                "clipboard"
            ),
        };

        var order = 1;
        foreach (var (title, shortDesc, longDesc, icon) in items)
        {
            context.Services.Add(new Service
            {
                Title = title,
                Slug = SlugHelper.Generate(title),
                ShortDescription = shortDesc,
                Description = longDesc,
                Icon = icon,
                SortOrder = order++,
                IsPublished = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ReplaceProductsAsync(ApplicationDbContext context)
    {
        var current = await context.SoftwareProducts.Where(p => !p.IsDeleted).ToListAsync();
        foreach (var item in current)
        {
            item.IsDeleted = true;
            item.IsPublished = false;
            item.IsFeatured = false;
            item.Slug = $"{item.Slug}-archived-{item.Id:N}"[..Math.Min(80, $"{item.Slug}-archived-{item.Id:N}".Length)];
            item.UpdatedAt = DateTime.UtcNow;
        }

        var products = new (string Name, string Short, string Long, string Features, bool Featured, int Row)[]
        {
            (
                "Home & Villa Lift",
                "Compact residential elevator with a laminated-glass enclosure — designed for tight shafts.",
                "<p>Our latest residential lift is built for small elevator spaces. It uses an elegant structural shaft with safety laminated glass (5×5 mm, 10 mm thickness), no car door to maximize cabin space, and a full-height infrared entrance sensor.</p><p>Hall doors are also safety laminated glass. Minimum shaft 900 mm × 1,100 mm, overhead 2,400 mm, pit 100 mm, supply single-phase 220/230 VAC.</p>",
                "[\"Residential and villa use\",\"Safety laminated glass enclosure\",\"Full-height infrared entrance sensor\",\"Minimum shaft 900 × 1100 mm\"]",
                true,
                1
            ),
            ("Passenger Elevator", "Comfortable, efficient passenger lifts for residential and commercial buildings.", "<p>Passenger elevators specified for traffic, finish, and building architecture — MRL or SMR.</p>", "[\"MRL or SMR\",\"Residential and commercial\",\"Specified to building traffic\"]", false, 1),
            ("Freight Elevator", "Heavy-duty cargo lifts for goods, equipment, and back-of-house operations.", "<p>Freight and cargo lifts in traction or hydraulic configurations for reliable material movement.</p>", "[\"Traction or hydraulic\",\"Goods and equipment\",\"Back-of-house operations\"]", false, 1),
            ("Scenic Elevator", "Glass observation lifts that add presence to lobbies, malls, and atriums.", "<p>Scenic lifts designed for visibility and architectural impact without compromising safety.</p>", "[\"Observation / glass cabin\",\"Lobbies and atriums\",\"Architectural integration\"]", false, 1),
            ("Hospital Bed Lift", "Stretcher and bed elevators for hospitals and medical facilities.", "<p>Hospital bed lifts sized and specified for patient transport, caregivers, and medical equipment.</p>", "[\"Stretcher / bed capacity\",\"Healthcare facilities\",\"Caregiver access\"]", false, 2),
            ("Dumbwaiter", "Service lifts for kitchens, pantries, and light goods between floors.", "<p>Compact dumbwaiters for food service, documents, and light cargo between levels.</p>", "[\"Kitchens and pantries\",\"Light goods\",\"Compact shaft\"]", false, 2),
            ("Wheelchair Lift", "Accessibility lifts for PWD and barrier-free building access.", "<p>Wheelchair lifts specified for safe, dignified access in public and private buildings.</p>", "[\"PWD access\",\"Public and private buildings\",\"Safety-focused design\"]", false, 2),
            ("Escalator", "Standard escalators for commercial, transit, and mixed-use properties.", "<p>Escalators specified for passenger volume, rise, and daily commercial use.</p>", "[\"Commercial traffic\",\"Specified rise and width\",\"Daily public use\"]", false, 2),
            ("Walkalator & Moving Walkway", "Moving walkways for malls, terminals, and long horizontal circulation.", "<p>Walkalators and moving walkways that keep people moving comfortably across longer distances.</p>", "[\"Malls and terminals\",\"Horizontal circulation\",\"PWD-friendly movement\"]", false, 2),
            ("Stair Lift", "Stair lifts for seniors and persons with limited mobility.", "<p>Stair lifts that restore access on existing stairways where a full elevator is not practical.</p>", "[\"Seniors and PWD\",\"Existing stairways\",\"Residential and light commercial\"]", false, 2),
        };

        var order = 1;
        foreach (var (name, shortDesc, longDesc, features, featured, row) in products)
        {
            context.SoftwareProducts.Add(new SoftwareProduct
            {
                Name = name,
                Slug = SlugHelper.Generate(name),
                ShortDescription = shortDesc,
                Description = longDesc,
                FeaturesJson = features,
                ScreenshotsJson = "[]",
                LogoUrl = string.Empty,
                SortOrder = order++,
                IsFeatured = featured,
                HomepageRow = row,
                IsPublished = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ReplaceIndustriesAsync(ApplicationDbContext context)
    {
        var current = await context.Industries.Where(i => !i.IsDeleted).ToListAsync();
        foreach (var item in current)
        {
            item.IsDeleted = true;
            item.IsPublished = false;
            item.Slug = $"{item.Slug}-archived-{item.Id:N}"[..Math.Min(80, $"{item.Slug}-archived-{item.Id:N}".Length)];
            item.UpdatedAt = DateTime.UtcNow;
        }

        var items = new (string Name, string Description)[]
        {
            ("Residential", "Home, villa, and condominium lifts specified for tight shafts and daily family use."),
            ("Commercial & Office", "Passenger elevators and escalators for towers, offices, and mixed commercial buildings."),
            ("Hospitals & Healthcare", "Bed lifts, passenger elevators, and accessibility equipment for medical facilities."),
            ("Hospitality", "Quiet, presentable vertical transportation for hotels and serviced residences."),
            ("Mixed-Use Developments", "Coordinated elevator and escalator systems for podiums, parking, and tower stacks."),
            ("Industrial", "Freight, cargo, and service lifts for warehouses, plants, and back-of-house operations."),
        };

        var order = 1;
        foreach (var (name, description) in items)
        {
            context.Industries.Add(new Industry
            {
                Name = name,
                Slug = SlugHelper.Generate(name),
                ShortDescription = description,
                IconUrl = string.Empty,
                SortOrder = order++,
                IsPublished = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ReplaceFaqAsync(ApplicationDbContext context)
    {
        var current = await context.FaqItems.Where(f => !f.IsDeleted).ToListAsync();
        foreach (var item in current)
        {
            item.IsDeleted = true;
            item.IsPublished = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        var items = new (string Q, string A)[]
        {
            ("Do you service all elevator and escalator brands?", "Yes. We provide service and maintenance for all types and brands of elevators, escalators, and related equipment, including periodic inspection of components and parts."),
            ("Is assessment and consultation free?", "Yes. Free assessment and consultation is available for existing equipment and new inquiries within Metro Manila, Mega Manila, and nearby cities."),
            ("Can you install an elevator in a building without a shaft?", "Yes. We offer structural supply and installation for buildings without an existing elevator shaft, including compact residential lifts with their own structural enclosure."),
            ("What types of elevators and escalators do you supply?", "Passenger, freight, scenic, hospital bed, home/villa, dumbwaiter, cargo (traction or hydraulic), wheelchair, and scissor lifts, plus standard escalators, walkalators, moving walkways, and stair lifts."),
            ("Do you modernize old or faulty control systems?", "Yes. Control-system modernization is recommended for aging or frequently faulty equipment. Our integrated controls are compatible with many brands, easier to maintain, and typically use less electricity."),
            ("How do I request a quote?", "Send a message through the contact form, call our trunkline during office hours, or visit by appointment at our Las Piñas office. We typically respond within one business day."),
        };

        var order = 1;
        foreach (var (question, answer) in items)
        {
            context.FaqItems.Add(new FaqItem
            {
                Question = question,
                Answer = answer,
                SortOrder = order++,
                IsPublished = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ReplaceStatsAsync(ApplicationDbContext context)
    {
        var current = await context.SiteStats.Where(s => !s.IsDeleted).ToListAsync();
        foreach (var item in current)
        {
            item.IsDeleted = true;
            item.IsPublished = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        var items = new (string Value, string Label, string Icon)[]
        {
            ("1996", "Established", "award"),
            ("30+", "Years of experience", "users"),
            ("All brands", "Equipment serviced", "wrench"),
            ("Metro Manila", "Free assessment", "headset"),
        };

        var order = 1;
        foreach (var (value, label, icon) in items)
        {
            context.SiteStats.Add(new SiteStat
            {
                Value = value,
                Label = label,
                Icon = icon,
                SortOrder = order++,
                IsPublished = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ReplaceHighlightsAsync(ApplicationDbContext context)
    {
        var current = await context.CompanyHighlights.Where(h => !h.IsDeleted).ToListAsync();
        foreach (var item in current)
        {
            item.IsDeleted = true;
            item.IsPublished = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        var items = new (string Title, string Description)[]
        {
            ("Integrity", "Straightforward specifications, honest recommendations, and work we can stand behind."),
            ("Discipline", "Standards and client specifications followed from production through jobsite handling."),
            ("Efficiency", "Practical systems — including modernization — that lower energy use and maintenance cost."),
            ("Accountability", "Clear ownership from assessment and installation through service and maintenance."),
        };

        var order = 1;
        foreach (var (title, description) in items)
        {
            context.CompanyHighlights.Add(new CompanyHighlight
            {
                Title = title,
                Description = description,
                SortOrder = order++,
                HomepageRow = 1,
                IsPublished = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ReplaceProcessAsync(ApplicationDbContext context)
    {
        var current = await context.ProcessSteps.Where(p => !p.IsDeleted).ToListAsync();
        foreach (var item in current)
        {
            item.IsDeleted = true;
            item.IsPublished = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        var items = new (string Step, string Title, string Description)[]
        {
            ("01", "Inquiry & assessment", "Free assessment and consultation for Metro Manila, Mega Manila, and nearby cities."),
            ("02", "Survey & proposal", "We match equipment to shaft, traffic, accessibility, and the building’s actual conditions."),
            ("03", "Production", "We see to it that standards and client specifications are followed before anything ships."),
            ("04", "Jobsite handling", "Parts arrive complete and undamaged, with proper unloading at the area provided by the client."),
            ("05", "Installation & testing", "Safe installation, commissioning, and handover for residential and commercial projects."),
            ("06", "Service & maintenance", "Periodic checkups and support for all brands and types of equipment after turnover."),
        };

        var order = 1;
        foreach (var (step, title, description) in items)
        {
            context.ProcessSteps.Add(new ProcessStep
            {
                StepLabel = step,
                Title = title,
                Description = description,
                SortOrder = order++,
                IsPublished = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task ReplaceClientsAsync(ApplicationDbContext context)
    {
        var current = await context.Clients.Where(c => !c.IsDeleted).ToListAsync();
        foreach (var item in current)
        {
            item.IsDeleted = true;
            item.IsPublished = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        var clients = new (string Name, string Location)[]
        {
            ("Almayo / The Prime Building", "Taguig City"),
            ("Arm Skin Essential", "Dr. Alvin Soap"),
            ("Bicol International Airport", "Daraga, Albay"),
            ("Uratex", ""),
            ("CJ Automotive / Chandler", "Vito Cruz, Manila"),
            ("CITIC Tower", "Quezon City"),
            ("Fumaco", "San Juan City"),
            ("Horizon Tower", "Angeles City, Pampanga"),
            ("Hotel Kimberly", "Malate, Manila"),
            ("Metro Vigan Hospital", "Ilocos Sur"),
            ("My Town New York", "Makati City"),
            ("Gigawatt Property", "Taguig City"),
        };
        foreach (var (name, location) in clients)
        {
            context.Clients.Add(new Client
            {
                Name = name,
                Location = location,
                Website = string.Empty,
                LogoUrl = string.Empty,
                IsPublished = true,
            });
        }

        await context.SaveChangesAsync();
    }

    private static async Task UnpublishSoftwareLeftoversAsync(ApplicationDbContext context)
    {
        foreach (var item in await context.Testimonials.Where(t => !t.IsDeleted).ToListAsync())
        {
            item.IsPublished = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        foreach (var item in await context.Technologies.Where(t => !t.IsDeleted).ToListAsync())
        {
            item.IsPublished = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        foreach (var item in await context.Blogs.Where(b => !b.IsDeleted).ToListAsync())
        {
            item.IsPublished = false;
            item.UpdatedAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();
    }

    private static async Task AlignSeoAsync(ApplicationDbContext context)
    {
        var pages = await context.SeoSettings.ToListAsync();
        var byKey = pages.ToDictionary(p => p.PageKey, StringComparer.OrdinalIgnoreCase);

        void Set(string pageKey, string title, string description, bool published)
        {
            if (!byKey.TryGetValue(pageKey, out var row))
                return;
            row.Title = title;
            row.Description = description;
            row.Keywords = "elevator, escalator, maintenance, modernization, Las Piñas, DREAM";
            row.IsPublished = published;
            row.UpdatedAt = DateTime.UtcNow;
        }

        Set("home", "DREAM | Elevator & Escalator Corp.", "Elevators, escalators, and lifting equipment — supply, installation, modernization, and maintenance since 1996.", true);
        Set("about", "Who We Are | DREAM", "Dream Elevator & Escalator Corp. (DEEC) has served the vertical transportation industry since 1996.", true);
        Set("services", "Services | DREAM", "Elevators, escalators, control modernization, maintenance, parts, and structural shafts.", true);
        Set("products", "Products | DREAM", "Passenger, freight, scenic, hospital, home/villa, accessibility lifts, escalators, and moving walkways.", true);
        Set("portfolio", "Projects | DREAM", "Selected projects and installations by DREAM Elevator & Escalator Corp.", true);
        Set("gallery", "Gallery | DREAM", "Jobsite photos from elevator and escalator installation, modernization, and service work.", true);
        Set("clients", "Our Valued Clients | DREAM", "Buildings and facilities served by DREAM Elevator & Escalator Corp.", true);
        Set("industries", "Sectors We Serve | DREAM", "Residential, commercial, healthcare, hospitality, mixed-use, and industrial buildings.", true);
        Set("contact", "Contact | DREAM", "Las Piñas office, trunkline, and quote requests. Visit is by appointment only.", true);
        Set("privacy", "Privacy Policy | DREAM", "How DREAM Elevator & Escalator Corp. handles inquiries and personal information.", true);
        Set("terms", "Terms & Conditions | DREAM", "Terms of use for the DREAM Elevator & Escalator Corp. website.", true);
        Set("technologies", "Technologies | DREAM", "Control systems and equipment platforms we support.", false);
        Set("blog", "Insights | DREAM", "Articles from DREAM Elevator & Escalator Corp.", false);
        Set("careers", "Careers | DREAM", "Join DREAM Elevator & Escalator Corp.", false);

        await context.SaveChangesAsync();
    }

    private static (string Key, string Value, string Group, bool IsPublic)[] Settings() =>
        new (string Key, string Value, string Group, bool IsPublic)[]
        {
        ("company_email", "elevatordream@yahoo.com", "contact", true),
        ("company_phone", "+63 2 8260 6852", "contact", true),
        ("company_address", "Lot 3B, Blk 1 Tulips St., Equitable Village, Talon Kuatro, Las Piñas 1747, Philippines", "contact", true),
        ("company_website", "www.dreamelevatorandescalator.com", "contact", true),
        ("footer_text", "Our Experience, Your Advantage — elevators, escalators, and lifting equipment since 1996.", "general", true),
        ("social_facebook", "https://www.facebook.com/ELEVATORDREAM", "social", true),
        ("social_linkedin", "", "social", true),
        ("social_facebook_enabled", "true", "social", true),
        ("social_linkedin_enabled", "false", "social", true),
        ("social_whatsapp", "639276126421", "social", true),
        ("social_whatsapp_enabled", "true", "social", true),
        ("hero_tagline", "OUR EXPERIENCE, YOUR ADVANTAGE", "home", true),
        ("hero_agency_label", "Vertical transportation since 1996", "home", true),
        ("hero_title_line1", "An uplifting experience", "home", true),
        ("hero_title_highlight", "for every building", "home", true),
        ("company_established", "Est. 1996", "home", true),
        ("company_hq_label", "Las Piñas, Philippines", "home", true),
        ("home_intro_eyebrow", "What we do", "home", true),
        ("home_intro_story_label", "Our story", "home", true),
        ("home_intro_services_label", "All services", "home", true),
        ("home_intro_line1", "Elevators, escalators, and", "home", true),
        ("home_intro_line2", "lifting equipment", "home", true),
        ("home_intro_line3", "done with care", "home", true),
        ("home_intro_body", "Dream Elevator & Escalator Corp. (DEEC) began in 1996 with maintenance and subcontracting, then expanded in 2015 into sale, supply, and installation. Incorporated in 2021, we deliver safe, reliable vertical transportation for residential and commercial projects.", "home", true),
        ("now_building_items", "Passenger elevators,Escalators,Control modernization,Preventive maintenance", "home", true),
        ("hero_description", "We offer elevators, escalators, and other lifting equipment — from supply and installation to modernization and long-term service.", "home", true),
        ("hero_highlights", "Elevators|Passenger, freight, scenic, hospital, home, and accessibility lifts — MRL or SMR.|/services;;Escalators|Standard escalators, walkalators, moving walkways, and stair lifts.|/services;;Modernization|Reliable control upgrades that cut energy use and maintenance cost.|/services", "home", true),
        ("hero_panel_eyebrow", "Request a quote", "home", true),
        ("hero_panel_title", "Have a project? We want to work with you.", "home", true),
        ("hero_panel_body", "DREAM Elevator & Escalator Corp. supplies, installs, modernizes, and maintains elevators, escalators, and related lifting equipment. Free assessment is available in Metro Manila, Mega Manila, and nearby cities.", "home", true),
        ("hero_panel_points", "Free Metro Manila assessment,All brands serviced,Supply & installation,Maintenance & modernization", "home", true),
        ("about_intro", "Dream Elevator & Escalator Corp. (DEEC) is a corporation organized under the laws of the Republic of the Philippines, with principal office in Talon Kuatro, Las Piñas City. We offer elevators, escalators, and other lifting equipment for residential and commercial projects.", "about", true),
        ("about_secondary", "DEEC began in 1996 with maintenance and subcontracting for elevator and escalator installations. In 2015 we expanded into sale, supply, and installation of elevators, escalators, wheelchair lifts, and mobility equipment. We incorporated in 2021 to strengthen those services while staying grounded in safety, quality, and customer satisfaction.", "about", true),
        ("about_page_eyebrow", "Who we are", "about", true),
        ("about_page_title", "Our experience, your advantage", "about", true),
        ("about_page_subtitle", "Quietly built knowledge in vertical transportation since 1996 — now a full supply, installation, modernization, and maintenance partner.", "about", true),
        ("about_mission", "To provide high-quality service consistent with world safety standards, with cost-effective solutions at affordable prices. Our services adapt to fast-changing technology so products remain compatible with upgrades.", "about", true),
        ("about_vision", "To build long-term relationships with clients through effective service that helps us grow together and contribute to economic development — and to elevate the quality of life of every DEEC member and employee.", "about", true),
        ("about_story_eyebrow", "Our story", "about", true),
        ("about_story_title", "From maintenance roots to a full vertical-transportation partner", "about", true),
        ("privacy_content", "<p>Last updated: August 2026</p><h2>Information We Collect</h2><p>We collect information you provide directly, such as when you request a quote, fill out our contact form, or call our office.</p><h2>How We Use Your Information</h2><p>We use collected information to respond to inquiries, prepare assessments and proposals, provide service, and communicate about your project.</p><h2>Data Security</h2><p>We implement appropriate measures to protect personal data against unauthorized access, alteration, or destruction.</p><h2>Contact</h2><p>For privacy-related inquiries, contact us at elevatordream@yahoo.com.</p>", "legal", true),
        ("terms_content", "<p>Last updated: August 2026</p><h2>Terms of Use</h2><p>By accessing this website, you agree to be bound by these terms.</p><h2>Services</h2><p>DREAM Elevator & Escalator Corp. provides sale, supply, installation, modernization, and maintenance of elevators, escalators, and related lifting equipment as described on this website.</p><h2>Contact</h2><p>Lot 3B, Blk 1 Tulips St., Equitable Village, Talon Kuatro, Las Piñas 1747, Philippines. Email elevatordream@yahoo.com.</p>", "legal", true),
        ("home_stats_eyebrow", "Since 1996", "home", true),
        ("home_stats_title", "Built on experience", "home", true),
        ("home_stats_subtitle", "Maintenance roots, expanded supply and installation, and a long-term service commitment.", "home", true),
        ("home_services_eyebrow", "What we do", "home", true),
        ("home_services_title", "Elevators, escalators, and complete support", "home", true),
        ("home_services_subtitle", "Supply, installation, modernization, maintenance, parts, and structural shafts — tailored to each building.", "home", true),
        ("home_clients_eyebrow", "Trusted by", "home", true),
        ("home_clients_title", "Our valued clients", "home", true),
        ("home_clients_subtitle", "Selected buildings and facilities we are proud to serve.", "home", true),
        ("home_featured_product_eyebrow", "Latest product", "home", true),
        ("home_featured_product_title", "Residential lift for tight shafts", "home", true),
        ("home_featured_product_subtitle", "An elegant home and villa lift with laminated-glass enclosure, infrared entrance protection, and a compact structural shaft.", "home", true),
        ("home_products_eyebrow", "Equipment", "home", true),
        ("home_products_title", "Lifts and moving systems", "home", true),
        ("home_products_subtitle", "Passenger, freight, scenic, hospital, home, accessibility, escalators, and moving walkways.", "home", true),
        ("home_industries_eyebrow", "Sectors", "home", true),
        ("home_industries_title", "Buildings we serve", "home", true),
        ("home_industries_subtitle", "Residential, commercial, healthcare, hospitality, mixed-use, and industrial facilities.", "home", true),
        ("home_why_eyebrow", "Core values", "home", true),
        ("home_why_title", "Integrity, discipline, efficiency, accountability", "home", true),
        ("home_why_subtitle", "The standards that guide how we specify, install, and maintain every system.", "home", true),
        ("home_process_eyebrow", "How we work", "home", true),
        ("home_process_title", "Supply and jobsite process", "home", true),
        ("home_process_subtitle", "From free assessment through production, careful unloading, installation, and maintenance.", "home", true),
        ("home_portfolio_eyebrow", "Gallery", "home", true),
        ("home_portfolio_title", "Projects in the field", "home", true),
        ("home_portfolio_subtitle", "Installations and modernization work across residential and commercial buildings.", "home", true),
        ("home_faq_eyebrow", "FAQ", "home", true),
        ("home_faq_title", "Common questions", "home", true),
        ("home_faq_subtitle", "Brands we service, free assessments, shafts, modernization, and how to request a quote.", "home", true),
        ("home_cta_title", "Have a project? Request a quote.", "home", true),
        ("home_cta_subtitle", "Tell us about the building, the equipment, or the problem — we will help you plan the right path forward.", "home", true),
        ("home_cta_primary_label", "Get a quote", "home", true),
        ("home_cta_secondary_label", "View services", "home", true),
        ("contact_page_title", "Contact us", "pages", true),
        ("contact_page_subtitle", "Visit is by appointment only. Call, message, or request a quote and we will connect you with the right team.", "pages", true),
        ("contact_response_promise", "We typically respond within one business day.", "contact", true),
        ("contact_main_eyebrow", "Las Piñas office", "contact", true),
        ("contact_main_title", "Let’s start with an assessment", "contact", true),
        ("contact_main_subtitle", "Trunkline (02) 8260 6852 · Mobile 0927 612 6421 / 0933 856 0622 / 0991 341 0811 · elevatordream@yahoo.com", "contact", true),
        ("contact_form_title", "Request a quote", "contact", true),
        ("contact_form_subtitle", "Share the site, equipment type, and what you need — installation, modernization, or maintenance.", "contact", true),
        ("contact_expect_eyebrow", "What happens next", "contact", true),
        ("contact_expect_title", "From first message to site assessment", "contact", true),
        ("contact_expect_subtitle", "A straightforward path so you know what to expect after reaching out.", "contact", true),
        ("contact_expect_step1_title", "Send your inquiry", "contact", true),
        ("contact_expect_step1_text", "Tell us the building, equipment brand or type, and whether you need supply, modernization, or service.", "contact", true),
        ("contact_expect_step2_title", "We review & respond", "contact", true),
        ("contact_expect_step2_text", "Our team replies within one business day and, when applicable, schedules a free Metro Manila assessment.", "contact", true),
        ("contact_expect_step3_title", "Survey & proposal", "contact", true),
        ("contact_expect_step3_text", "We confirm shaft and site conditions, then recommend equipment or a maintenance plan.", "contact", true),
        ("contact_map_eyebrow", "Visit us", "contact", true),
        ("contact_map_title", "Las Piñas office", "contact", true),
        ("contact_map_subtitle", "Visit is by appointment only. Use the map for directions to Equitable Village, Talon Kuatro.", "contact", true),
        ("contact_office_hours_title", "Office hours", "contact", true),
        ("contact_office_hours", "Mon–Fri|8:00 AM – 5:00 PM\nSat|8:00 AM – 12:00 NN\nSun|Closed", "contact", true),
        ("contact_office_hours_note", "Visit is by appointment only. Trunkline is staffed 8:00 AM – 5:00 PM, Monday to Friday.", "contact", true),
        ("contact_careers_enabled", "false", "contact", true),
        ("home_technologies_enabled", "false", "home", true),
        ("home_blog_enabled", "false", "home", true),
        ("home_testimonials_enabled", "false", "home", true),
        ("careers_page_title", "Careers", "pages", true),
        ("careers_page_subtitle", "Join a team that keeps buildings moving safely.", "pages", true),
        ("industries_page_title", "Sectors we serve", "pages", true),
        ("industries_page_subtitle", "Vertical transportation for the buildings people live, work, and heal in.", "pages", true),
        ("services_page_title", "Our services", "pages", true),
        ("services_page_subtitle", "Elevators, escalators, modernization, maintenance, parts, and structural shafts.", "pages", true),
        ("services_section_eyebrow", "What we do", "pages", true),
        ("services_section_title", "Complete vertical transportation support", "pages", true),
        ("services_section_subtitle", "From first assessment through installation and long-term service — for every brand and building type we take on.", "pages", true),
        ("about_industries_eyebrow", "Sectors", "about", true),
        ("about_industries_title", "Buildings we serve", "about", true),
        ("about_industries_subtitle", "Residential towers, hospitals, hotels, offices, mixed-use, and industrial facilities.", "about", true),
        ("about_products_promo_eyebrow", "Equipment", "about", true),
        ("about_products_promo_title", "Lifts and moving systems", "about", true),
        ("about_products_promo_subtitle", "Passenger, freight, scenic, hospital, home, accessibility equipment, escalators, and moving walkways.", "about", true),
        ("products_page_eyebrow", "Equipment", "products", true),
        ("products_page_title", "Lifts, escalators, and accessibility", "products", true),
        ("products_page_subtitle", "Specified to the shaft, the traffic, and the way the building is actually used.", "products", true),
        ("products_featured_eyebrow", "Latest product", "products", true),
        ("products_featured_title", "Home and villa lift", "products", true),
        ("products_featured_subtitle", "Compact residential elevator with laminated-glass enclosure and infrared entrance protection.", "products", true),
        ("products_catalog_eyebrow", "Catalog", "products", true),
        ("products_catalog_title", "Equipment we supply", "products", true),
        ("products_catalog_subtitle", "Elevators, escalators, moving walkways, and accessibility lifts for residential and commercial projects.", "products", true),
        ("products_cta_title", "Need a survey or a quote?", "products", true),
        ("products_cta_subtitle", "Tell us about the shaft, the building, or the existing equipment. Free assessment is available in Metro Manila and nearby cities.", "products", true),
        ("products_cta_primary_label", "Request a quote", "products", true),
        ("products_cta_secondary_label", "View services", "products", true),
        ("about_cta_title", "Have a project? We want to work with you.", "about", true),
        ("about_cta_subtitle", "Request a quote or book an assessment — we typically respond within one business day.", "about", true),
        ("about_why_eyebrow", "Core values", "about", true),
        ("about_why_title", "How we work with every client", "about", true),
        ("about_why_subtitle", "Integrity, discipline, efficiency, and accountability — from specification through maintenance.", "about", true),
        ("about_process_eyebrow", "Process", "about", true),
        ("about_process_title", "Supply and jobsite process", "about", true),
        ("about_process_subtitle", "Standards and specifications in production, careful handling on site, then installation and service.", "about", true),
        };

    private static (string Key, string Value, string Group, bool IsPublic)[] V2Settings() =>
        new (string Key, string Value, string Group, bool IsPublic)[]
        {
            ("company_email_alt", "dreamelevator@myyahoo.com", "contact", true),
            ("company_mobiles", "0927 612 6421\n0933 856 0622\n0991 341 0811", "contact", true),
            ("gallery_page_title", "Gallery", "pages", true),
            ("gallery_page_subtitle", "Jobsite photos from installation, modernization, and service work across residential and commercial buildings.", "pages", true),
            ("gallery_images", GalleryImagesJson(), "gallery", true),
            ("clients_page_title", "Our valued clients", "pages", true),
            ("clients_page_subtitle", "Buildings and facilities we are proud to serve.", "pages", true),
            ("gallery_list_dark_bg", "false", "sections", true),
            ("clients_list_dark_bg", "false", "sections", true),
        };

    private static string GalleryImagesJson()
    {
        const string feb = "https://dreamelevatorandescalator.com/wp-content/uploads/2023/02/";
        const string mar = "https://dreamelevatorandescalator.com/wp-content/uploads/2023/03/";
        var items = new (string Src, string Alt)[]
        {
            ($"{feb}installation-01.jpg", "Elevator installation"),
            ($"{feb}installation-02.jpg", "Elevator installation"),
            ($"{feb}installation-03.jpg", "Elevator installation"),
            ($"{feb}installation-04.jpg", "Elevator shaft work"),
            ($"{feb}installation-05.jpg", "Elevator installation"),
            ($"{feb}process-intallation-01.png", "Installation in progress"),
            ($"{feb}process-intallation-02.png", "Installation in progress"),
            ($"{feb}process-intallation-hydrau.png", "Hydraulic lift installation"),
            ($"{feb}process-intallation-hydrau-2.png", "Hydraulic lift installation"),
            ($"{feb}process-unloading-01.png", "Jobsite unloading"),
            ($"{feb}process-unloading-02.png", "Jobsite unloading"),
            ($"{feb}process-jsc-01.png", "Jobsite coordination"),
            ($"{feb}process-jsc-02.png", "Jobsite coordination"),
            ($"{feb}prod-coor-01.png", "Production coordination"),
            ($"{feb}prod-coor-02.png", "Production coordination"),
            ($"{feb}service-02.png", "Service and maintenance"),
            ($"{feb}csm1.png", "Control system work"),
            ($"{feb}csm2.png", "Control system work"),
            ($"{feb}latest-project_.jpg", "Recent project"),
            ($"{feb}about-us-01.png", "DREAM operations"),
            ($"{feb}about-us-02.png", "DREAM operations"),
            ($"{feb}about-us-03.png", "DREAM operations"),
            ($"{mar}20220216_150627.jpg", "Jobsite photo"),
            ($"{mar}20220209_094039.jpg", "Jobsite photo"),
            ($"{mar}20220209_094032.jpg", "Jobsite photo"),
            ($"{mar}20211207_135517.jpg", "Jobsite photo"),
            ($"{mar}20211201_070055.jpg", "Jobsite photo"),
            ($"{mar}20210922_111930.jpg", "Jobsite photo"),
            ($"{mar}20210922_111917.jpg", "Jobsite photo"),
            ($"{mar}20210908_153850.jpg", "Jobsite photo"),
            ($"{mar}20210820_111051-1.jpg", "Jobsite photo"),
            ($"{mar}20210820_151842.jpg", "Jobsite photo"),
            ($"{mar}20210812_143722.jpg", "Jobsite photo"),
            ($"{mar}20210812_143715.jpg", "Jobsite photo"),
            ($"{mar}20210812_143659.jpg", "Jobsite photo"),
            ($"{mar}20210812_125948.jpg", "Jobsite photo"),
            ($"{mar}20210803_150428.jpg", "Jobsite photo"),
            ($"{mar}20210802_102036.jpg", "Jobsite photo"),
            ($"{mar}20181010_094023.jpg", "Jobsite photo"),
            ($"{mar}20181010_094000.jpg", "Jobsite photo"),
            ($"{mar}20181010_093957.jpg", "Jobsite photo"),
        };

        return JsonSerializer.Serialize(items.Select(i => new { src = i.Src, alt = i.Alt }));
    }
}
