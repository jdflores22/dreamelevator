using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace DreamElevator.API.Middleware;

public class ActivityLogMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly HashSet<string> MutationMethods = new(StringComparer.OrdinalIgnoreCase) { "POST", "PUT", "PATCH", "DELETE" };

    public ActivityLogMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, IApplicationDbContext dbContext)
    {
        await _next(context);

        if (!MutationMethods.Contains(context.Request.Method))
            return;

        if (context.User.Identity?.IsAuthenticated != true)
            return;

        var role = context.User.FindFirstValue(ClaimTypes.Role);
        if (role is not ("SuperAdmin" or "Editor" or "Staff" or "Accounting" or "Admin"))
            return;

        var userIdClaim = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return;

        var path = context.Request.Path.Value ?? string.Empty;
        var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var entity = segments.Length >= 3 ? segments[2] : "unknown";
        var entityId = segments.Length >= 4 ? segments[3] : string.Empty;

        dbContext.Add(new ActivityLog
        {
            UserId = userId,
            Action = context.Request.Method,
            Entity = entity,
            EntityId = entityId,
            Details = $"{context.Request.Method} {path} - Status {context.Response.StatusCode}",
            Timestamp = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();
    }
}
