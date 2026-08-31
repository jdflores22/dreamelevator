using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MySqlConnector;
using TransNet.Domain.Interfaces;
using TransNet.Persistence;

namespace TransNet.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = BuildFromParts(configuration)
            ?? configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Configure DB_HOST, DB_NAME, DB_USER and DB_PASSWORD, or a 'DefaultConnection' connection string");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 33))));

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        return services;
    }

    /// <summary>
    /// Hosts like Railway are easier to manage with one value per setting, and it keeps a
    /// password containing ';' from silently truncating the connection string.
    /// </summary>
    private static string? BuildFromParts(IConfiguration configuration)
    {
        var host = configuration["DB_HOST"];
        var name = configuration["DB_NAME"];
        var user = configuration["DB_USER"];
        var password = configuration["DB_PASSWORD"];

        if (string.IsNullOrWhiteSpace(host)
            || string.IsNullOrWhiteSpace(name)
            || string.IsNullOrWhiteSpace(user))
        {
            return null;
        }

        var builder = new MySqlConnectionStringBuilder
        {
            Server = host.Trim(),
            Port = uint.TryParse(configuration["DB_PORT"], out var port) ? port : 3306u,
            Database = name.Trim(),
            UserID = user.Trim(),
            Password = password ?? string.Empty,
        };

        return builder.ConnectionString;
    }
}
