using TransNet.Domain.Entities;

namespace TransNet.Domain.Interfaces;

public interface IApplicationDbContext
{
    IQueryable<User> Users { get; }
    IQueryable<Role> Roles { get; }
    IQueryable<Permission> Permissions { get; }
    IQueryable<RolePermission> RolePermissions { get; }
    IQueryable<Service> Services { get; }
    IQueryable<Project> Projects { get; }
    IQueryable<Client> Clients { get; }
    IQueryable<Portfolio> Portfolios { get; }
    IQueryable<SoftwareProduct> SoftwareProducts { get; }
    IQueryable<Industry> Industries { get; }
    IQueryable<FaqItem> FaqItems { get; }
    IQueryable<SiteStat> SiteStats { get; }
    IQueryable<CompanyHighlight> CompanyHighlights { get; }
    IQueryable<ProcessStep> ProcessSteps { get; }
    IQueryable<Technology> Technologies { get; }
    IQueryable<BlogCategory> BlogCategories { get; }
    IQueryable<Blog> Blogs { get; }
    IQueryable<Testimonial> Testimonials { get; }
    IQueryable<ContactMessage> ContactMessages { get; }
    IQueryable<Subscriber> Subscribers { get; }
    IQueryable<Career> Careers { get; }
    IQueryable<JobApplication> JobApplications { get; }
    IQueryable<SiteSetting> SiteSettings { get; }
    IQueryable<SeoSetting> SeoSettings { get; }
    IQueryable<ActivityLog> ActivityLogs { get; }
    IQueryable<InventoryPart> InventoryParts { get; }
    IQueryable<InventoryIssuance> InventoryIssuances { get; }
    IQueryable<Supplier> Suppliers { get; }
    IQueryable<Employee> Employees { get; }
    IQueryable<StockMovement> StockMovements { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    void Add<T>(T entity) where T : class;
    void Update<T>(T entity) where T : class;
    void Remove<T>(T entity) where T : class;
}
