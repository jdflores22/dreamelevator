using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Suppliers;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class SupplierService : ISupplierService
{
    private readonly IApplicationDbContext _context;

    public SupplierService(IApplicationDbContext context) => _context = context;

    public async Task<(List<SupplierDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        bool activeOnly = false,
        int page = 1,
        int pageSize = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Suppliers.Where(s => !s.IsDeleted);

        if (activeOnly)
            query = query.Where(s => s.IsPublished);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(s =>
                s.Name.Contains(term) ||
                s.ContactPerson.Contains(term) ||
                s.Email.Contains(term) ||
                s.Phone.Contains(term) ||
                s.Country.Contains(term));
        }

        query = query.OrderBy(s => s.SortOrder).ThenBy(s => s.Name);

        var (items, meta) = await QueryExtensions.ToPagedListAsync(query, page, pageSize, cancellationToken);
        var counts = await LineCountsAsync(items.Select(s => s.Name), cancellationToken);
        return (items.Select(s => Map(s, CountOf(counts, s.Name))).ToList(), meta);
    }

    public async Task<SupplierDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);
        if (entity is null) return null;
        var counts = await LineCountsAsync(new[] { entity.Name }, cancellationToken);
        return Map(entity, CountOf(counts, entity.Name));
    }

    public async Task<SupplierDto> CreateAsync(UpsertSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var name = dto.Name?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("Supplier name is required.");

        if (await NameExistsAsync(name, excludeId: null, cancellationToken))
            throw new InvalidOperationException($"Supplier \"{name}\" already exists.");

        var entity = new Supplier();
        Apply(entity, dto, name);
        _context.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var counts = await LineCountsAsync(new[] { entity.Name }, cancellationToken);
        return Map(entity, CountOf(counts, entity.Name));
    }

    public async Task<SupplierDto?> UpdateAsync(Guid id, UpsertSupplierDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);
        if (entity is null) return null;

        var name = dto.Name?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("Supplier name is required.");

        if (await NameExistsAsync(name, excludeId: entity.Id, cancellationToken))
            throw new InvalidOperationException($"Supplier \"{name}\" already exists.");

        var previousName = entity.Name;
        Apply(entity, dto, name);
        entity.UpdatedAt = DateTime.UtcNow;

        // Register lines store the supplier name, so a rename has to follow through.
        if (!string.Equals(previousName, name, StringComparison.Ordinal))
            await RenameRegisterLinesAsync(previousName, name, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        var counts = await LineCountsAsync(new[] { entity.Name }, cancellationToken);
        return Map(entity, CountOf(counts, entity.Name));
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);
        if (entity is null) return false;

        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task RenameRegisterLinesAsync(string oldName, string newName, CancellationToken cancellationToken)
    {
        var affected = await _context.InventoryParts
            .Where(p => !p.IsDeleted && p.Supplier == oldName)
            .ToListAsync(cancellationToken);

        foreach (var line in affected)
        {
            line.Supplier = newName;
            line.UpdatedAt = DateTime.UtcNow;
        }
    }

    private async Task<bool> NameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken)
    {
        var query = _context.Suppliers.Where(s => !s.IsDeleted && s.Name == name);
        if (excludeId.HasValue)
            query = query.Where(s => s.Id != excludeId.Value);
        return await query.AnyAsync(cancellationToken);
    }

    private async Task<Dictionary<string, int>> LineCountsAsync(
        IEnumerable<string> names,
        CancellationToken cancellationToken)
    {
        var list = names.Where(n => !string.IsNullOrWhiteSpace(n)).Distinct().ToList();
        if (list.Count == 0)
            return new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        var rows = await _context.InventoryParts
            .Where(p => !p.IsDeleted && list.Contains(p.Supplier))
            .GroupBy(p => p.Supplier)
            .Select(g => new { Name = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(r => r.Name, r => r.Count, StringComparer.OrdinalIgnoreCase);
    }

    private static int CountOf(IReadOnlyDictionary<string, int> counts, string name) =>
        counts.TryGetValue(name, out var count) ? count : 0;

    private static void Apply(Supplier entity, UpsertSupplierDto dto, string name)
    {
        entity.Name = name;
        entity.ContactPerson = dto.ContactPerson?.Trim() ?? string.Empty;
        entity.Email = dto.Email?.Trim() ?? string.Empty;
        entity.Phone = dto.Phone?.Trim() ?? string.Empty;
        entity.Country = dto.Country?.Trim() ?? string.Empty;
        entity.Address = dto.Address?.Trim() ?? string.Empty;
        entity.Notes = dto.Notes?.Trim() ?? string.Empty;
        entity.SortOrder = dto.SortOrder;
        entity.IsPublished = dto.IsPublished;
    }

    private static SupplierDto Map(Supplier entity, int lineCount) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        ContactPerson = entity.ContactPerson,
        Email = entity.Email,
        Phone = entity.Phone,
        Country = entity.Country,
        Address = entity.Address,
        Notes = entity.Notes,
        SortOrder = entity.SortOrder,
        IsPublished = entity.IsPublished,
        LineCount = lineCount,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
    };
}
