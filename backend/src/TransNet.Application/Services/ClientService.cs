using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Clients;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class ClientService : IClientService
{
    private readonly IApplicationDbContext _context;

    public ClientService(IApplicationDbContext context) => _context = context;

    public async Task<(List<ClientDto> Items, ResponseMeta Meta)> GetAllAsync(bool adminView, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var query = QueryExtensions.ApplyPublicFilter(_context.Clients, adminView).OrderBy(c => c.Name);
        var (items, meta) = await QueryExtensions.ToPagedListAsync(query, page, pageSize, cancellationToken);
        return (items.Select(Map).ToList(), meta);
    }

    public async Task<ClientDto?> GetByIdAsync(Guid id, bool adminView, CancellationToken cancellationToken = default)
    {
        var entity = await QueryExtensions.ApplyPublicFilter(_context.Clients, adminView)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<ClientDto> CreateAsync(CreateClientDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Client
        {
            Name = dto.Name,
            LogoUrl = dto.LogoUrl,
            Location = dto.Location,
            Website = dto.Website,
            IsPublished = dto.IsPublished
        };
        _context.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<ClientDto?> UpdateAsync(Guid id, UpdateClientDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken);
        if (entity is null) return null;

        entity.Name = dto.Name;
        entity.LogoUrl = dto.LogoUrl;
        entity.Location = dto.Location;
        entity.Website = dto.Website;
        entity.IsPublished = dto.IsPublished;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Clients.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken);
        if (entity is null) return false;

        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static ClientDto Map(Client entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        LogoUrl = entity.LogoUrl,
        Location = entity.Location,
        Website = entity.Website,
        IsPublished = entity.IsPublished,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt
    };
}
