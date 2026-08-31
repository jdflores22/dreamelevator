using System.Text;
using System.Xml.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Persistence;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route($"{ApiConstants.ApiRoute}/sitemap")]
public class SitemapController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SitemapController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    [Produces("application/xml")]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var baseUrl = await ResolveSiteBaseUrlAsync(cancellationToken);
        var ns = XNamespace.Get("http://www.sitemaps.org/schemas/sitemap/0.9");
        var urls = new List<XElement>();

        void AddUrl(string path, DateTime? lastMod = null, string changeFreq = "weekly", string priority = "0.7")
        {
            var loc = $"{baseUrl}{path}";
            var el = new XElement(ns + "url", new XElement(ns + "loc", loc));
            if (lastMod.HasValue)
                el.Add(new XElement(ns + "lastmod", lastMod.Value.ToString("yyyy-MM-dd")));
            el.Add(new XElement(ns + "changefreq", changeFreq));
            el.Add(new XElement(ns + "priority", priority));
            urls.Add(el);
        }

        AddUrl("/", changeFreq: "daily", priority: "1.0");
        foreach (var path in new[] { "/about", "/services", "/products", "/portfolio", "/gallery", "/clients", "/technologies", "/industries", "/blog", "/careers", "/contact", "/privacy", "/terms" })
            AddUrl(path, changeFreq: "monthly", priority: "0.8");

        var services = await _db.Services.AsNoTracking()
            .Where(x => x.IsPublished && !x.IsDeleted)
            .Select(x => new { x.Slug, x.UpdatedAt })
            .ToListAsync(cancellationToken);
        foreach (var s in services)
            AddUrl($"/services/{s.Slug}", s.UpdatedAt, "monthly", "0.7");

        var products = await _db.SoftwareProducts.AsNoTracking()
            .Where(x => x.IsPublished && !x.IsDeleted)
            .Select(x => new { x.Slug, x.UpdatedAt })
            .ToListAsync(cancellationToken);
        foreach (var p in products)
            AddUrl($"/products/{p.Slug}", p.UpdatedAt, "monthly", "0.7");

        var portfolio = await _db.Portfolios.AsNoTracking()
            .Where(x => x.IsPublished && !x.IsDeleted)
            .Select(x => new { x.Slug, x.UpdatedAt })
            .ToListAsync(cancellationToken);
        foreach (var p in portfolio)
            AddUrl($"/portfolio/{p.Slug}", p.UpdatedAt, "monthly", "0.6");

        var blogs = await _db.Blogs.AsNoTracking()
            .Where(x => x.IsPublished && !x.IsDeleted)
            .Select(x => new { x.Slug, x.UpdatedAt, x.PublishedAt })
            .ToListAsync(cancellationToken);
        foreach (var b in blogs)
            AddUrl($"/blog/{b.Slug}", b.PublishedAt ?? b.UpdatedAt, "weekly", "0.6");

        var careers = await _db.Careers.AsNoTracking()
            .Where(x => x.IsPublished && !x.IsDeleted)
            .Select(x => new { x.Slug, x.UpdatedAt })
            .ToListAsync(cancellationToken);
        foreach (var c in careers)
            AddUrl($"/careers#{c.Slug}", c.UpdatedAt, "weekly", "0.5");

        var doc = new XDocument(
            new XDeclaration("1.0", "utf-8", null),
            new XElement(ns + "urlset", urls));

        var sb = new StringBuilder();
        using (var writer = new StringWriter(sb))
            doc.Save(writer, SaveOptions.None);

        return Content(sb.ToString(), "application/xml", Encoding.UTF8);
    }

    private async Task<string> ResolveSiteBaseUrlAsync(CancellationToken cancellationToken)
    {
        var website = await _db.SiteSettings.AsNoTracking()
            .Where(s => s.Key == "company_website")
            .Select(s => s.Value)
            .FirstOrDefaultAsync(cancellationToken);

        var raw = string.IsNullOrWhiteSpace(website)
            ? $"{Request.Scheme}://{Request.Host.Value}"
            : website.Trim();
        if (!raw.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
            !raw.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            raw = $"https://{raw.TrimStart('/')}";
        return raw.TrimEnd('/');
    }
}
