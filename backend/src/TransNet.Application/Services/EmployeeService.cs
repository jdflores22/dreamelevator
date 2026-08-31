using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Employees;
using TransNet.Application.DTOs.InventoryParts;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class EmployeeService : IEmployeeService
{
    private const int ProfileIssuanceLimit = 100;

    private readonly IApplicationDbContext _context;

    public EmployeeService(IApplicationDbContext context) => _context = context;

    public async Task<(List<EmployeeDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        string? department,
        bool activeOnly = false,
        int page = 1,
        int pageSize = 100,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Employees.Where(e => !e.IsDeleted);

        if (activeOnly)
            query = query.Where(e => e.IsPublished);

        if (!string.IsNullOrWhiteSpace(department))
        {
            var dept = department.Trim();
            query = query.Where(e => e.Department == dept);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(e =>
                e.FirstName.Contains(term) ||
                e.LastName.Contains(term) ||
                e.EmployeeCode.Contains(term) ||
                e.Position.Contains(term) ||
                e.Department.Contains(term) ||
                e.Email.Contains(term) ||
                e.Phone.Contains(term));
        }

        query = query.OrderBy(e => e.SortOrder).ThenBy(e => e.FirstName).ThenBy(e => e.LastName);

        var (items, meta) = await QueryExtensions.ToPagedListAsync(query, page, pageSize, cancellationToken);
        var stats = await StatsAsync(items.Select(e => e.Id), cancellationToken);
        return (items.Select(e => Map(e, StatOf(stats, e.Id))).ToList(), meta);
    }

    public async Task<EmployeeDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await FindAsync(id, cancellationToken);
        if (entity is null) return null;
        var stats = await StatsAsync(new[] { id }, cancellationToken);
        return Map(entity, StatOf(stats, id));
    }

    public async Task<EmployeeProfileDto?> GetProfileAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await FindAsync(id, cancellationToken);
        if (entity is null) return null;

        var issuances = await _context.InventoryIssuances
            .Where(i => !i.IsDeleted && i.ReceivedByEmployeeId == id)
            .OrderByDescending(i => i.IssuedAt)
            .ThenByDescending(i => i.CreatedAt)
            .Take(ProfileIssuanceLimit)
            .ToListAsync(cancellationToken);

        var topItems = await _context.InventoryIssuances
            .Where(i => !i.IsDeleted && i.ReceivedByEmployeeId == id)
            .GroupBy(i => i.Item)
            .Select(g => new EmployeeItemTotalDto
            {
                Item = g.Key,
                Quantity = g.Sum(x => x.Quantity),
                Count = g.Count(),
            })
            .OrderByDescending(x => x.Quantity)
            .Take(10)
            .ToListAsync(cancellationToken);

        var stats = await StatsAsync(new[] { id }, cancellationToken);

        return new EmployeeProfileDto
        {
            Employee = Map(entity, StatOf(stats, id)),
            Issuances = issuances.Select(i => MapIssuance(i, entity)).ToList(),
            TopItems = topItems,
        };
    }

    public async Task<List<string>> GetDepartmentsAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.Employees
            .Where(e => !e.IsDeleted && e.Department != "")
            .Select(e => e.Department)
            .ToListAsync(cancellationToken);

        return rows
            .Select(d => d.Trim())
            .Where(d => d.Length > 0)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(d => d)
            .ToList();
    }

    public async Task<EmployeeDto> CreateAsync(UpsertEmployeeDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Employee();
        await ApplyAsync(entity, dto, cancellationToken);
        _context.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return Map(entity, default);
    }

    public async Task<EmployeeDto?> UpdateAsync(Guid id, UpsertEmployeeDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await FindAsync(id, cancellationToken);
        if (entity is null) return null;

        await ApplyAsync(entity, dto, cancellationToken);
        entity.UpdatedAt = DateTime.UtcNow;

        // Slips keep a name snapshot, so a rename has to follow through to past stock-outs.
        await SyncIssuanceSnapshotAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var stats = await StatsAsync(new[] { id }, cancellationToken);
        return Map(entity, StatOf(stats, id));
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await FindAsync(id, cancellationToken);
        if (entity is null) return false;

        entity.IsDeleted = true;
        entity.IsPublished = false;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private Task<Employee?> FindAsync(Guid id, CancellationToken cancellationToken) =>
        _context.Employees.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted, cancellationToken);

    private async Task ApplyAsync(Employee entity, UpsertEmployeeDto dto, CancellationToken cancellationToken)
    {
        var firstName = dto.FirstName?.Trim() ?? string.Empty;
        var lastName = dto.LastName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(lastName))
            throw new InvalidOperationException("Employee name is required.");

        var code = dto.EmployeeCode?.Trim() ?? string.Empty;
        if (code.Length > 0 && await CodeExistsAsync(code, entity.Id, cancellationToken))
            throw new InvalidOperationException($"Employee ID \"{code}\" is already used.");

        if (dto.UserId.HasValue)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId.Value, cancellationToken);
            if (!userExists)
                throw new InvalidOperationException("Linked login account was not found.");
        }

        entity.EmployeeCode = code;
        entity.FirstName = firstName;
        entity.LastName = lastName;
        entity.Position = dto.Position?.Trim() ?? string.Empty;
        entity.Department = dto.Department?.Trim() ?? string.Empty;
        entity.Email = dto.Email?.Trim() ?? string.Empty;
        entity.Phone = dto.Phone?.Trim() ?? string.Empty;
        entity.PhotoUrl = dto.PhotoUrl?.Trim() ?? string.Empty;
        entity.HiredAt = dto.HiredAt?.Date;
        entity.Notes = dto.Notes?.Trim() ?? string.Empty;
        entity.SortOrder = dto.SortOrder;
        entity.UserId = dto.UserId;
        entity.IsPublished = dto.IsPublished;
    }

    private async Task SyncIssuanceSnapshotAsync(Employee entity, CancellationToken cancellationToken)
    {
        var rows = await _context.InventoryIssuances
            .Where(i => !i.IsDeleted && i.ReceivedByEmployeeId == entity.Id)
            .ToListAsync(cancellationToken);

        foreach (var row in rows)
        {
            row.ReceivedByName = entity.FullName;
            row.UpdatedAt = DateTime.UtcNow;
        }
    }

    private async Task<bool> CodeExistsAsync(string code, Guid excludeId, CancellationToken cancellationToken) =>
        await _context.Employees.AnyAsync(
            e => !e.IsDeleted && e.EmployeeCode == code && e.Id != excludeId,
            cancellationToken);

    private async Task<Dictionary<Guid, EmployeeStats>> StatsAsync(
        IEnumerable<Guid> ids,
        CancellationToken cancellationToken)
    {
        var list = ids.Distinct().ToList();
        if (list.Count == 0)
            return new Dictionary<Guid, EmployeeStats>();

        var rows = await _context.InventoryIssuances
            .Where(i => !i.IsDeleted && i.ReceivedByEmployeeId != null && list.Contains(i.ReceivedByEmployeeId!.Value))
            .GroupBy(i => i.ReceivedByEmployeeId!.Value)
            .Select(g => new
            {
                EmployeeId = g.Key,
                Count = g.Count(),
                Quantity = g.Sum(x => x.Quantity),
                LastIssuedAt = g.Max(x => x.IssuedAt),
            })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(
            r => r.EmployeeId,
            r => new EmployeeStats(r.Count, r.Quantity, r.LastIssuedAt));
    }

    private static EmployeeStats StatOf(IReadOnlyDictionary<Guid, EmployeeStats> stats, Guid id) =>
        stats.TryGetValue(id, out var value) ? value : default;

    private static InventoryIssuanceDto MapIssuance(InventoryIssuance entity, Employee employee) => new()
    {
        Id = entity.Id,
        InventoryPartId = entity.InventoryPartId,
        Item = entity.Item,
        Specification = entity.Specification,
        Quantity = entity.Quantity,
        IssuedAt = entity.IssuedAt,
        ReceivedByEmployeeId = entity.ReceivedByEmployeeId,
        ReceivedByUserId = entity.ReceivedByUserId,
        ReceivedByName = entity.ReceivedByName,
        ReceivedByPosition = string.IsNullOrWhiteSpace(entity.ReceivedByPosition)
            ? employee.Position
            : entity.ReceivedByPosition,
        ReceivedByCode = employee.EmployeeCode,
        ReceivedByDepartment = employee.Department,
        ReceivedByPhotoUrl = employee.PhotoUrl,
        ClientId = entity.ClientId,
        ClientName = entity.ClientName,
        ProjectBuilding = entity.ProjectBuilding,
        Purpose = entity.Purpose,
        Notes = entity.Notes,
        IssuedByUserId = entity.IssuedByUserId,
        IsPublished = entity.IsPublished,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
    };

    private static EmployeeDto Map(Employee entity, EmployeeStats stats) => new()
    {
        Id = entity.Id,
        EmployeeCode = entity.EmployeeCode,
        FirstName = entity.FirstName,
        LastName = entity.LastName,
        FullName = entity.FullName,
        Position = entity.Position,
        Department = entity.Department,
        Email = entity.Email,
        Phone = entity.Phone,
        PhotoUrl = entity.PhotoUrl,
        HiredAt = entity.HiredAt,
        Notes = entity.Notes,
        SortOrder = entity.SortOrder,
        UserId = entity.UserId,
        IsPublished = entity.IsPublished,
        IssuanceCount = stats.Count,
        TotalQuantityIssued = stats.Quantity,
        LastIssuedAt = stats.LastIssuedAt,
        CreatedAt = entity.CreatedAt,
        UpdatedAt = entity.UpdatedAt,
    };

    private readonly record struct EmployeeStats(int Count, decimal Quantity, DateTime? LastIssuedAt);
}
