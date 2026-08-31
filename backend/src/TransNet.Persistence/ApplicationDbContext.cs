using Microsoft.EntityFrameworkCore;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Portfolio> Portfolios => Set<Portfolio>();
    public DbSet<SoftwareProduct> SoftwareProducts => Set<SoftwareProduct>();
    public DbSet<Industry> Industries => Set<Industry>();
    public DbSet<FaqItem> FaqItems => Set<FaqItem>();
    public DbSet<SiteStat> SiteStats => Set<SiteStat>();
    public DbSet<CompanyHighlight> CompanyHighlights => Set<CompanyHighlight>();
    public DbSet<ProcessStep> ProcessSteps => Set<ProcessStep>();
    public DbSet<Technology> Technologies => Set<Technology>();
    public DbSet<BlogCategory> BlogCategories => Set<BlogCategory>();
    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<Subscriber> Subscribers => Set<Subscriber>();
    public DbSet<Career> Careers => Set<Career>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();
    public DbSet<SeoSetting> SeoSettings => Set<SeoSetting>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();
    public DbSet<InventoryPart> InventoryParts => Set<InventoryPart>();
    public DbSet<InventoryIssuance> InventoryIssuances => Set<InventoryIssuance>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    IQueryable<User> IApplicationDbContext.Users => Users;
    IQueryable<Role> IApplicationDbContext.Roles => Roles;
    IQueryable<Permission> IApplicationDbContext.Permissions => Permissions;
    IQueryable<RolePermission> IApplicationDbContext.RolePermissions => RolePermissions;
    IQueryable<Service> IApplicationDbContext.Services => Services;
    IQueryable<Project> IApplicationDbContext.Projects => Projects;
    IQueryable<Client> IApplicationDbContext.Clients => Clients;
    IQueryable<Portfolio> IApplicationDbContext.Portfolios => Portfolios;
    IQueryable<SoftwareProduct> IApplicationDbContext.SoftwareProducts => SoftwareProducts;
    IQueryable<Industry> IApplicationDbContext.Industries => Industries;
    IQueryable<FaqItem> IApplicationDbContext.FaqItems => FaqItems;
    IQueryable<SiteStat> IApplicationDbContext.SiteStats => SiteStats;
    IQueryable<CompanyHighlight> IApplicationDbContext.CompanyHighlights => CompanyHighlights;
    IQueryable<ProcessStep> IApplicationDbContext.ProcessSteps => ProcessSteps;
    IQueryable<Technology> IApplicationDbContext.Technologies => Technologies;
    IQueryable<BlogCategory> IApplicationDbContext.BlogCategories => BlogCategories;
    IQueryable<Blog> IApplicationDbContext.Blogs => Blogs;
    IQueryable<Testimonial> IApplicationDbContext.Testimonials => Testimonials;
    IQueryable<ContactMessage> IApplicationDbContext.ContactMessages => ContactMessages;
    IQueryable<Subscriber> IApplicationDbContext.Subscribers => Subscribers;
    IQueryable<Career> IApplicationDbContext.Careers => Careers;
    IQueryable<JobApplication> IApplicationDbContext.JobApplications => JobApplications;
    IQueryable<SiteSetting> IApplicationDbContext.SiteSettings => SiteSettings;
    IQueryable<SeoSetting> IApplicationDbContext.SeoSettings => SeoSettings;
    IQueryable<ActivityLog> IApplicationDbContext.ActivityLogs => ActivityLogs;
    IQueryable<InventoryPart> IApplicationDbContext.InventoryParts => InventoryParts;
    IQueryable<InventoryIssuance> IApplicationDbContext.InventoryIssuances => InventoryIssuances;
    IQueryable<Supplier> IApplicationDbContext.Suppliers => Suppliers;
    IQueryable<Employee> IApplicationDbContext.Employees => Employees;
    IQueryable<StockMovement> IApplicationDbContext.StockMovements => StockMovements;

    public new void Add<T>(T entity) where T : class => Set<T>().Add(entity);
    public new void Update<T>(T entity) where T : class => Set<T>().Update(entity);
    public new void Remove<T>(T entity) where T : class => Set<T>().Remove(entity);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RolePermission>().HasKey(rp => new { rp.RoleId, rp.PermissionId });
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Service>().HasIndex(s => s.Slug).IsUnique();
        modelBuilder.Entity<Portfolio>().HasIndex(p => p.Slug).IsUnique();
        modelBuilder.Entity<SoftwareProduct>().HasIndex(p => p.Slug).IsUnique();
        modelBuilder.Entity<Industry>().HasIndex(i => i.Slug).IsUnique();
        modelBuilder.Entity<Blog>().HasIndex(b => b.Slug).IsUnique();
        modelBuilder.Entity<BlogCategory>().HasIndex(c => c.Slug).IsUnique();
        modelBuilder.Entity<Career>().HasIndex(c => c.Slug).IsUnique();
        modelBuilder.Entity<SiteSetting>().HasIndex(s => s.Key).IsUnique();
        modelBuilder.Entity<SeoSetting>().HasIndex(s => s.PageKey).IsUnique();
        modelBuilder.Entity<Subscriber>().HasIndex(s => s.Email).IsUnique();

        modelBuilder.Entity<InventoryPart>(entity =>
        {
            entity.Property(p => p.Quantity).HasPrecision(18, 3);
            entity.Property(p => p.UnitPrice).HasPrecision(18, 4);
            entity.Property(p => p.TotalPrice).HasPrecision(18, 4);
            entity.Property(p => p.AmountInPeso).HasPrecision(18, 2);
            entity.Property(p => p.Supplier).HasMaxLength(255);
            entity.Property(p => p.Item).HasMaxLength(255);
            entity.Property(p => p.LineKind).HasMaxLength(32);
            entity.Property(p => p.Currency).HasMaxLength(8);
            entity.HasIndex(p => p.PurchasedAt);
            entity.HasIndex(p => p.Supplier);
            entity.HasIndex(p => p.Item);
            // Stock-outs and movements touch this row, so it doubles as the oversell guard.
            entity.Property(p => p.UpdatedAt).IsConcurrencyToken();
        });

        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.Property(m => m.Quantity).HasPrecision(18, 3);
            entity.Property(m => m.DamagedQuantity).HasPrecision(18, 3);
            entity.Property(m => m.Delta).HasPrecision(18, 3);
            entity.Property(m => m.MovementType).HasMaxLength(32);
            entity.Property(m => m.EmployeeName).HasMaxLength(255);
            entity.Property(m => m.Reason).HasMaxLength(255);
            entity.HasIndex(m => m.InventoryPartId);
            entity.HasIndex(m => m.OccurredAt);
            entity.HasIndex(m => m.SourceIssuanceId);
            entity.HasOne(m => m.InventoryPart)
                .WithMany()
                .HasForeignKey(m => m.InventoryPartId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(m => m.SourceIssuance)
                .WithMany()
                .HasForeignKey(m => m.SourceIssuanceId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(m => m.Employee)
                .WithMany()
                .HasForeignKey(m => m.EmployeeId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<InventoryIssuance>(entity =>
        {
            entity.Property(p => p.Quantity).HasPrecision(18, 3);
            entity.Property(p => p.Item).HasMaxLength(255);
            entity.Property(p => p.ReceivedByName).HasMaxLength(255);
            entity.Property(p => p.ReceivedByPosition).HasMaxLength(255);
            entity.HasIndex(p => p.ReceivedByEmployeeId);
            entity.HasOne(p => p.ReceivedByEmployee)
                .WithMany()
                .HasForeignKey(p => p.ReceivedByEmployeeId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.Property(p => p.ClientName).HasMaxLength(255);
            entity.Property(p => p.ProjectBuilding).HasMaxLength(255);
            entity.Property(p => p.Purpose).HasMaxLength(255);
            entity.HasIndex(p => p.IssuedAt);
            entity.HasIndex(p => p.InventoryPartId);
            entity.HasIndex(p => p.ClientId);
            entity.HasOne(p => p.InventoryPart)
                .WithMany()
                .HasForeignKey(p => p.InventoryPartId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Employee>(entity =>
        {
            entity.Ignore(e => e.FullName);
            entity.Property(e => e.EmployeeCode).HasMaxLength(64);
            entity.Property(e => e.FirstName).HasMaxLength(128);
            entity.Property(e => e.LastName).HasMaxLength(128);
            entity.Property(e => e.Position).HasMaxLength(128);
            entity.Property(e => e.Department).HasMaxLength(128);
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Phone).HasMaxLength(64);
            entity.Property(e => e.PhotoUrl).HasMaxLength(500);
            entity.HasIndex(e => e.EmployeeCode);
            entity.HasIndex(e => e.LastName);
        });

        modelBuilder.Entity<Supplier>(entity =>
        {
            entity.Property(s => s.Name).HasMaxLength(255);
            entity.Property(s => s.ContactPerson).HasMaxLength(255);
            entity.Property(s => s.Email).HasMaxLength(255);
            entity.Property(s => s.Phone).HasMaxLength(64);
            entity.Property(s => s.Country).HasMaxLength(128);
            entity.Property(s => s.Address).HasMaxLength(500);
            entity.HasIndex(s => s.Name);
        });

        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);
        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Permission).WithMany(p => p.RolePermissions).HasForeignKey(rp => rp.PermissionId);
    }
}
