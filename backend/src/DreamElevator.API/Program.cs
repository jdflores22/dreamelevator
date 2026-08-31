using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Serilog;
using System.Threading.RateLimiting;
using DreamElevator.API.Middleware;
using TransNet.Infrastructure;
using TransNet.Persistence;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console());

    builder.Services.AddInfrastructure(builder.Configuration);

    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new OpenApiInfo { Title = "DreamElevator API", Version = "v1" });
        options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme.",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });
        options.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                Array.Empty<string>()
            }
        });
    });

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Default", policy =>
        {
            if (builder.Environment.IsDevelopment())
            {
                policy.SetIsOriginAllowed(origin =>
                {
                    if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                        return false;
                    return uri.Host is "localhost" or "127.0.0.1";
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            }
            else
            {
                var configured = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                    ?? Array.Empty<string>();
                var origins = configured
                    .Where(o => !string.IsNullOrWhiteSpace(o))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToArray();

                Log.Information("CORS allowed origins: {Origins}", string.Join(", ", origins));

                if (origins.Length == 0)
                {
                    Log.Warning("No CORS origins configured for production");
                }
                else
                {
                    policy.WithOrigins(origins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                }
            }
        });
    });

    builder.Services.AddHealthChecks()
        .AddDbContextCheck<ApplicationDbContext>();

    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.AddPolicy("fixed", httpContext =>
        {
            if (httpContext.User.Identity?.IsAuthenticated == true)
                return RateLimitPartition.GetNoLimiter("authenticated");

            var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 180,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
            });
        });
    });

    builder.Services.AddScoped<DatabaseSeeder>();

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        Log.Information("Applying database migrations…");
        await db.Database.MigrateAsync();
        Log.Information("Database migrations applied");

        try
        {
            var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
            await seeder.SeedAsync();
        }
        catch (Exception ex)
        {
            // Don't block API startup when a partial/manual DB import leaves conflicting rows.
            Log.Warning(ex, "Database seeding failed — API will start without re-seeding");
        }
    }

    // A volume mounted at wwwroot/uploads starts empty, and static file serving needs
    // the directory to exist before the first upload creates it.
    try
    {
        var webRoot = app.Environment.WebRootPath
            ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
        Directory.CreateDirectory(Path.Combine(webRoot, "uploads"));
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Failed to create the uploads directory");
    }

    app.UseSerilogRequestLogging();
    app.UseMiddleware<ExceptionMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();
    app.UseCors("Default");
    app.UseStaticFiles();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseRateLimiter();
    app.UseMiddleware<ActivityLogMiddleware>();

    var controllers = app.MapControllers();
    if (!app.Environment.IsDevelopment())
        controllers.RequireRateLimiting("fixed");
    app.MapHealthChecks("/health");

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
