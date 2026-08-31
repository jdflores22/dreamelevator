using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Application.DTOs.InventoryParts;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class InventoryIssuanceService : IInventoryIssuanceService
{
    private readonly IApplicationDbContext _context;
    private readonly IStockBalanceService _balances;

    public InventoryIssuanceService(IApplicationDbContext context, IStockBalanceService balances)
    {
        _context = context;
        _balances = balances;
    }

    public async Task<(List<InventoryIssuanceDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        Guid? clientId,
        Guid? inventoryPartId,
        Guid? employeeId,
        DateTime? from,
        DateTime? to,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = _context.InventoryIssuances.Where(i => !i.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(i =>
                i.Item.Contains(term) ||
                i.Specification.Contains(term) ||
                i.ReceivedByName.Contains(term) ||
                i.ReceivedByPosition.Contains(term) ||
                i.ClientName.Contains(term) ||
                i.ProjectBuilding.Contains(term) ||
                i.Purpose.Contains(term) ||
                i.Notes.Contains(term));
        }

        if (clientId.HasValue)
            query = query.Where(i => i.ClientId == clientId);

        if (inventoryPartId.HasValue)
            query = query.Where(i => i.InventoryPartId == inventoryPartId);

        if (employeeId.HasValue)
            query = query.Where(i => i.ReceivedByEmployeeId == employeeId);

        if (from.HasValue)
            query = query.Where(i => i.IssuedAt >= from.Value.Date);

        if (to.HasValue)
            query = query.Where(i => i.IssuedAt < to.Value.Date.AddDays(1));

        query = query.OrderByDescending(i => i.IssuedAt).ThenByDescending(i => i.CreatedAt);

        var (items, meta) = await QueryExtensions.ToPagedListAsync(query, page, pageSize, cancellationToken);
        var userNames = await LoadUserNamesAsync(items, cancellationToken);
        var employees = await LoadEmployeesAsync(items, cancellationToken);
        var returned = await LoadReturnedAsync(items, cancellationToken);
        return (items.Select(i => Map(i, userNames, employees, returned)).ToList(), meta);
    }

    public async Task<InventoryIssuanceDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.InventoryIssuances.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (entity is null) return null;
        return await MapOneAsync(entity, cancellationToken);
    }

    public async Task<InventoryIssuanceDto> CreateAsync(
        UpsertInventoryIssuanceDto dto,
        Guid? issuedByUserId,
        CancellationToken cancellationToken = default)
    {
        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var entity = new InventoryIssuance
        {
            IssuedByUserId = issuedByUserId,
            IsPublished = dto.IsPublished,
        };

        await ApplyAsync(entity, dto, excludeIssuanceId: null, cancellationToken);
        _context.Add(entity);
        await SaveGuardedAsync(cancellationToken);

        return await MapOneAsync(entity, cancellationToken);
    }

    public async Task<InventoryIssuanceDto?> UpdateAsync(
        Guid id,
        UpsertInventoryIssuanceDto dto,
        CancellationToken cancellationToken = default)
    {
        var entity = await _context.InventoryIssuances.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (entity is null) return null;

        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        await ApplyAsync(entity, dto, excludeIssuanceId: entity.Id, cancellationToken);
        entity.UpdatedAt = DateTime.UtcNow;
        await SaveGuardedAsync(cancellationToken);

        return await MapOneAsync(entity, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.InventoryIssuances.FirstOrDefaultAsync(i => i.Id == id && !i.IsDeleted, cancellationToken);
        if (entity is null) return false;

        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<InventoryAvailabilityDto?> GetAvailabilityAsync(
        Guid inventoryPartId,
        CancellationToken cancellationToken = default)
    {
        var part = await _context.InventoryParts.FirstOrDefaultAsync(
            p => p.Id == inventoryPartId && !p.IsDeleted,
            cancellationToken);
        if (part is null) return null;

        var totals = await _balances.GetTotalsAsync(inventoryPartId, cancellationToken: cancellationToken);
        var purchased = part.Quantity ?? 0;
        return new InventoryAvailabilityDto
        {
            InventoryPartId = inventoryPartId,
            PurchasedQuantity = purchased,
            IssuedQuantity = totals.Issued,
            ReturnedQuantity = totals.Returned,
            AdjustedQuantity = totals.Adjusted,
            OnHand = totals.OnHandFrom(purchased),
        };
    }

    public async Task<InventoryIssuanceOptionsDto> GetOptionsAsync(CancellationToken cancellationToken = default)
    {
        var users = await _context.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email })
            .ToListAsync(cancellationToken);

        var recipients = users.Select(u =>
        {
            var name = $"{u.FirstName} {u.LastName}".Trim();
            return new InventoryRecipientOptionDto
            {
                Id = u.Id,
                Name = string.IsNullOrWhiteSpace(name) ? u.Email : name,
                Email = u.Email,
            };
        }).ToList();

        var parts = await _context.InventoryParts
            .Where(p => !p.IsDeleted && p.LineKind == "Part")
            .OrderByDescending(p => p.PurchasedAt)
            .ThenBy(p => p.Item)
            .ToListAsync(cancellationToken);

        var partIds = parts.Select(p => p.Id).ToList();
        var totalsByPart = await _balances.GetTotalsAsync(partIds, cancellationToken: cancellationToken);

        var available = parts.Select(p =>
        {
            var purchased = p.Quantity ?? 0;
            totalsByPart.TryGetValue(p.Id, out var totals);
            return new InventoryAvailablePartDto
            {
                Id = p.Id,
                Item = p.Item,
                Specification = p.Specification,
                Supplier = p.Supplier,
                ProjectBuilding = p.ProjectBuilding,
                PurchasedAt = p.PurchasedAt,
                PurchasedQuantity = purchased,
                IssuedQuantity = totals.Issued,
                OnHand = totals.OnHandFrom(purchased),
            };
        }).Where(p => p.OnHand > 0).ToList();

        var employees = await _context.Employees
            .Where(e => !e.IsDeleted && e.IsPublished)
            .OrderBy(e => e.SortOrder)
            .ThenBy(e => e.FirstName)
            .ThenBy(e => e.LastName)
            .Select(e => new InventoryEmployeeOptionDto
            {
                Id = e.Id,
                EmployeeCode = e.EmployeeCode,
                Name = (e.FirstName + " " + e.LastName).Trim(),
                Position = e.Position,
                Department = e.Department,
                PhotoUrl = e.PhotoUrl,
            })
            .ToListAsync(cancellationToken);

        return new InventoryIssuanceOptionsDto
        {
            Recipients = recipients,
            Employees = employees,
            AvailableParts = available,
        };
    }

    private async Task ApplyAsync(
        InventoryIssuance entity,
        UpsertInventoryIssuanceDto dto,
        Guid? excludeIssuanceId,
        CancellationToken cancellationToken)
    {
        InventoryPart? part = null;
        if (dto.InventoryPartId.HasValue)
        {
            part = await _context.InventoryParts.FirstOrDefaultAsync(
                p => p.Id == dto.InventoryPartId.Value && !p.IsDeleted,
                cancellationToken);
            if (part is null)
                throw new InvalidOperationException("Selected inventory line was not found.");
            if (!part.LineKind.Equals("Part", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Only Part lines can be issued.");

            var totals = await _balances.GetTotalsAsync(part.Id, excludeIssuanceId, cancellationToken);
            var onHand = totals.OnHandFrom(part.Quantity ?? 0);
            if (dto.Quantity > onHand)
                throw new InvalidOperationException($"Only {onHand:0.###} on hand for this line.");

            // Touching the line makes the concurrency token fire on simultaneous stock-outs.
            part.UpdatedAt = DateTime.UtcNow;
        }

        string receivedByName = dto.ReceivedByName?.Trim() ?? string.Empty;
        string receivedByPosition = string.Empty;
        if (dto.ReceivedByEmployeeId.HasValue)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(
                e => e.Id == dto.ReceivedByEmployeeId.Value && !e.IsDeleted,
                cancellationToken);
            if (employee is null)
                throw new InvalidOperationException("Selected employee was not found.");
            if (!employee.IsPublished)
                throw new InvalidOperationException("That employee is inactive and cannot receive stock.");
            receivedByName = employee.FullName;
            receivedByPosition = employee.Position;
        }
        else if (dto.ReceivedByUserId.HasValue)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.ReceivedByUserId.Value, cancellationToken);
            if (user is null)
                throw new InvalidOperationException("Selected recipient user was not found.");
            receivedByName = $"{user.FirstName} {user.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(receivedByName))
                receivedByName = user.Email;
        }

        if (string.IsNullOrWhiteSpace(receivedByName))
            throw new InvalidOperationException("Recipient is required (select an employee or enter a name).");

        string clientName = dto.ClientName?.Trim() ?? string.Empty;
        if (dto.ClientId.HasValue)
        {
            var client = await _context.Clients.FirstOrDefaultAsync(
                c => c.Id == dto.ClientId.Value && !c.IsDeleted,
                cancellationToken);
            if (client is null)
                throw new InvalidOperationException("Selected company/client was not found.");
            clientName = client.Name;
        }

        var item = dto.Item?.Trim() ?? string.Empty;
        var spec = dto.Specification?.Trim() ?? string.Empty;
        if (part is not null)
        {
            if (string.IsNullOrWhiteSpace(item)) item = part.Item;
            if (string.IsNullOrWhiteSpace(spec)) spec = part.Specification;
        }

        if (string.IsNullOrWhiteSpace(item))
            throw new InvalidOperationException("Item is required.");

        entity.InventoryPartId = dto.InventoryPartId;
        entity.Item = item;
        entity.Specification = spec;
        entity.Quantity = dto.Quantity;
        entity.IssuedAt = dto.IssuedAt?.Date ?? DateTime.UtcNow.Date;
        entity.ReceivedByEmployeeId = dto.ReceivedByEmployeeId;
        entity.ReceivedByUserId = dto.ReceivedByEmployeeId.HasValue ? null : dto.ReceivedByUserId;
        entity.ReceivedByName = receivedByName;
        entity.ReceivedByPosition = receivedByPosition;
        entity.ClientId = dto.ClientId;
        entity.ClientName = clientName;
        entity.ProjectBuilding = dto.ProjectBuilding?.Trim() ?? string.Empty;
        entity.Purpose = dto.Purpose?.Trim() ?? string.Empty;
        entity.Notes = dto.Notes?.Trim() ?? string.Empty;
        entity.IsPublished = dto.IsPublished;
    }

    private async Task SaveGuardedAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new InvalidOperationException(
                "Someone else just changed the stock on this line. Please reload and try again.");
        }
    }

    private async Task<Dictionary<Guid, string>> LoadUserNamesAsync(
        IEnumerable<InventoryIssuance> items,
        CancellationToken cancellationToken)
    {
        var ids = items
            .SelectMany(i => new Guid?[] { i.IssuedByUserId, i.ReceivedByUserId })
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return new Dictionary<Guid, string>();

        var users = await _context.Users
            .Where(u => ids.Contains(u.Id))
            .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email })
            .ToListAsync(cancellationToken);

        return users.ToDictionary(
            u => u.Id,
            u =>
            {
                var name = $"{u.FirstName} {u.LastName}".Trim();
                return string.IsNullOrWhiteSpace(name) ? u.Email : name;
            });
    }

    private async Task<InventoryIssuanceDto> MapOneAsync(
        InventoryIssuance entity,
        CancellationToken cancellationToken)
    {
        var single = new[] { entity };
        var userNames = await LoadUserNamesAsync(single, cancellationToken);
        var employees = await LoadEmployeesAsync(single, cancellationToken);
        var returned = await LoadReturnedAsync(single, cancellationToken);
        return Map(entity, userNames, employees, returned);
    }

    private async Task<Dictionary<Guid, decimal>> LoadReturnedAsync(
        IEnumerable<InventoryIssuance> items,
        CancellationToken cancellationToken)
    {
        var ids = items.Select(i => i.Id).Distinct().ToList();
        if (ids.Count == 0)
            return new Dictionary<Guid, decimal>();

        var rows = await _context.StockMovements
            .Where(m => !m.IsDeleted
                && m.SourceIssuanceId != null
                && ids.Contains(m.SourceIssuanceId.Value))
            .GroupBy(m => m.SourceIssuanceId!.Value)
            .Select(g => new { IssuanceId = g.Key, Qty = g.Sum(x => x.Quantity) })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(r => r.IssuanceId, r => r.Qty);
    }

    private async Task<Dictionary<Guid, Employee>> LoadEmployeesAsync(
        IEnumerable<InventoryIssuance> items,
        CancellationToken cancellationToken)
    {
        var ids = items
            .Where(i => i.ReceivedByEmployeeId.HasValue)
            .Select(i => i.ReceivedByEmployeeId!.Value)
            .Distinct()
            .ToList();

        if (ids.Count == 0)
            return new Dictionary<Guid, Employee>();

        return await _context.Employees
            .Where(e => ids.Contains(e.Id))
            .ToDictionaryAsync(e => e.Id, cancellationToken);
    }

    private static InventoryIssuanceDto Map(
        InventoryIssuance entity,
        IReadOnlyDictionary<Guid, string> userNames,
        IReadOnlyDictionary<Guid, Employee> employees,
        IReadOnlyDictionary<Guid, decimal> returnedByIssuance)
    {
        userNames.TryGetValue(entity.IssuedByUserId ?? Guid.Empty, out var issuedByName);
        employees.TryGetValue(entity.ReceivedByEmployeeId ?? Guid.Empty, out var employee);
        returnedByIssuance.TryGetValue(entity.Id, out var returned);
        return new InventoryIssuanceDto
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
                ? employee?.Position ?? string.Empty
                : entity.ReceivedByPosition,
            ReceivedByCode = employee?.EmployeeCode ?? string.Empty,
            ReceivedByDepartment = employee?.Department ?? string.Empty,
            ReceivedByPhotoUrl = employee?.PhotoUrl ?? string.Empty,
            ClientId = entity.ClientId,
            ClientName = entity.ClientName,
            ProjectBuilding = entity.ProjectBuilding,
            Purpose = entity.Purpose,
            Notes = entity.Notes,
            IssuedByUserId = entity.IssuedByUserId,
            IssuedByName = issuedByName ?? string.Empty,
            ReturnedQuantity = returned,
            ReturnableQuantity = Math.Max(0, entity.Quantity - returned),
            IsPublished = entity.IsPublished,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt,
        };
    }
}
