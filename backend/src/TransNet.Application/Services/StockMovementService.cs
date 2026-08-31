using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Application.DTOs.InventoryParts;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class StockMovementService : IStockMovementService
{
    private readonly IApplicationDbContext _context;
    private readonly IStockBalanceService _balances;

    public StockMovementService(IApplicationDbContext context, IStockBalanceService balances)
    {
        _context = context;
        _balances = balances;
    }

    public async Task<(List<StockMovementDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        string? movementType,
        Guid? inventoryPartId,
        Guid? employeeId,
        DateTime? from,
        DateTime? to,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = _context.StockMovements.Where(m => !m.IsDeleted);

        if (!string.IsNullOrWhiteSpace(movementType))
        {
            var type = movementType.Trim();
            query = query.Where(m => m.MovementType == type);
        }

        if (inventoryPartId.HasValue)
            query = query.Where(m => m.InventoryPartId == inventoryPartId.Value);

        if (employeeId.HasValue)
            query = query.Where(m => m.EmployeeId == employeeId.Value);

        if (from.HasValue)
            query = query.Where(m => m.OccurredAt >= from.Value.Date);

        if (to.HasValue)
            query = query.Where(m => m.OccurredAt < to.Value.Date.AddDays(1));

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(m =>
                m.EmployeeName.Contains(term) ||
                m.Reason.Contains(term) ||
                m.Notes.Contains(term) ||
                (m.InventoryPart != null && m.InventoryPart.Item.Contains(term)));
        }

        query = query.OrderByDescending(m => m.OccurredAt).ThenByDescending(m => m.CreatedAt);

        var (items, meta) = await QueryExtensions.ToPagedListAsync(query, page, pageSize, cancellationToken);
        return (await MapManyAsync(items, cancellationToken), meta);
    }

    public async Task<StockMovementDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.StockMovements.FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted, cancellationToken);
        if (entity is null) return null;
        var mapped = await MapManyAsync(new[] { entity }, cancellationToken);
        return mapped.First();
    }

    public async Task<StockLedgerDto?> GetLedgerAsync(Guid inventoryPartId, CancellationToken cancellationToken = default)
    {
        var part = await _context.InventoryParts.FirstOrDefaultAsync(
            p => p.Id == inventoryPartId && !p.IsDeleted,
            cancellationToken);
        if (part is null) return null;

        var issuances = await _context.InventoryIssuances
            .Where(i => !i.IsDeleted && i.InventoryPartId == inventoryPartId)
            .ToListAsync(cancellationToken);

        var movements = await _context.StockMovements
            .Where(m => !m.IsDeleted && m.InventoryPartId == inventoryPartId)
            .ToListAsync(cancellationToken);

        var purchased = part.Quantity ?? 0;

        var entries = new List<StockLedgerEntryDto>
        {
            new()
            {
                Id = part.Id,
                Kind = "Purchase",
                OccurredAt = part.PurchasedAt ?? part.CreatedAt,
                Delta = purchased,
                Reference = part.Supplier,
                Notes = part.Notes,
            },
        };

        entries.AddRange(issuances.Select(i => new StockLedgerEntryDto
        {
            Id = i.Id,
            Kind = "Stock out",
            OccurredAt = i.IssuedAt ?? i.CreatedAt,
            Delta = -i.Quantity,
            Reference = i.ReceivedByName,
            Notes = i.Purpose,
        }));

        entries.AddRange(movements.Select(m => new StockLedgerEntryDto
        {
            Id = m.Id,
            Kind = m.DamagedQuantity > 0 && m.MovementType == StockMovementTypes.Return
                ? $"Return ({m.DamagedQuantity:0.###} damaged)"
                : m.MovementType,
            OccurredAt = m.OccurredAt ?? m.CreatedAt,
            Delta = m.Delta,
            Reference = m.EmployeeName,
            Notes = string.IsNullOrWhiteSpace(m.Reason) ? m.Notes : m.Reason,
        }));

        entries = entries.OrderBy(e => e.OccurredAt).ToList();

        decimal running = 0;
        foreach (var entry in entries)
        {
            running += entry.Delta;
            entry.Balance = running;
        }

        var totals = await _balances.GetTotalsAsync(inventoryPartId, cancellationToken: cancellationToken);

        return new StockLedgerDto
        {
            InventoryPartId = part.Id,
            Item = part.Item,
            Specification = part.Specification,
            Supplier = part.Supplier,
            PurchasedQuantity = purchased,
            IssuedQuantity = totals.Issued,
            ReturnedQuantity = totals.Returned,
            AdjustedQuantity = totals.Adjusted,
            DamagedQuantity = totals.Damaged,
            OnHand = totals.OnHandFrom(purchased),
            Entries = entries,
        };
    }

    public async Task<StockMovementDto> CreateAsync(
        UpsertStockMovementDto dto,
        Guid? recordedByUserId,
        CancellationToken cancellationToken = default)
    {
        var type = (dto.MovementType ?? string.Empty).Trim();
        if (!StockMovementTypes.IsValid(type))
            throw new InvalidOperationException("Movement type must be Return, Damage, Loss, or Adjustment.");

        if (dto.Quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var part = await _context.InventoryParts.FirstOrDefaultAsync(
            p => p.Id == dto.InventoryPartId && !p.IsDeleted,
            cancellationToken);
        if (part is null)
            throw new InvalidOperationException("Selected inventory line was not found.");
        if (!part.LineKind.Equals("Part", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Only Part lines carry stock.");

        var isReturn = type == StockMovementTypes.Return;
        var tiedToIssuance = dto.SourceIssuanceId.HasValue;
        if (tiedToIssuance && type == StockMovementTypes.Adjustment)
            throw new InvalidOperationException("A count adjustment cannot be tied to a stock-out.");

        // Pieces tied to a stock-out already left stock, so a write-off there must not deduct twice.
        var writeOffFromField = tiedToIssuance && !isReturn;
        var damaged = isReturn
            ? dto.DamagedQuantity
            : writeOffFromField && type == StockMovementTypes.Damage
                ? dto.Quantity
                : 0;
        if (damaged < 0)
            throw new InvalidOperationException("Damaged quantity cannot be negative.");
        if (damaged > dto.Quantity)
            throw new InvalidOperationException("Damaged quantity cannot exceed the returned quantity.");

        var increases = type == StockMovementTypes.Adjustment ? dto.Increase : StockMovementTypes.IsIncrease(type);

        // Damaged pieces already left stock on the stock-out, so only the good ones come back.
        var delta = writeOffFromField ? 0 : increases ? dto.Quantity - damaged : -dto.Quantity;

        var totals = await _balances.GetTotalsAsync(part.Id, cancellationToken: cancellationToken);
        var purchased = part.Quantity ?? 0;
        var onHand = totals.OnHandFrom(purchased);

        if (delta < 0 && dto.Quantity > onHand)
            throw new InvalidOperationException($"Only {onHand:0.###} on hand for this line.");

        var employeeName = dto.EmployeeName?.Trim() ?? string.Empty;
        if (dto.EmployeeId.HasValue)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(
                e => e.Id == dto.EmployeeId.Value && !e.IsDeleted,
                cancellationToken);
            if (employee is null)
                throw new InvalidOperationException("Selected employee was not found.");
            employeeName = employee.FullName;
        }

        Guid? sourceIssuanceId = null;
        if (dto.SourceIssuanceId.HasValue)
        {
            var issuance = await _context.InventoryIssuances.FirstOrDefaultAsync(
                i => i.Id == dto.SourceIssuanceId.Value && !i.IsDeleted,
                cancellationToken);
            if (issuance is null)
                throw new InvalidOperationException("Selected stock-out was not found.");
            if (issuance.InventoryPartId != part.Id)
                throw new InvalidOperationException("That stock-out is for a different inventory line.");

            // Count pieces, not net delta, so a damaged or lost piece also uses up the balance.
            var alreadySettled = await _context.StockMovements
                .Where(m => !m.IsDeleted && m.SourceIssuanceId == issuance.Id)
                .SumAsync(m => m.Quantity, cancellationToken);

            if (dto.Quantity + alreadySettled > issuance.Quantity)
            {
                var left = issuance.Quantity - alreadySettled;
                throw new InvalidOperationException(
                    left <= 0
                        ? "That stock-out has already been fully settled."
                        : $"Only {left:0.###} left to settle on that stock-out.");
            }

            sourceIssuanceId = issuance.Id;
            if (string.IsNullOrWhiteSpace(employeeName))
                employeeName = issuance.ReceivedByName;
            if (!dto.EmployeeId.HasValue && issuance.ReceivedByEmployeeId.HasValue)
                dto.EmployeeId = issuance.ReceivedByEmployeeId;
        }

        // Returns can never put more back than what actually went out on this line.
        if (isReturn && !dto.SourceIssuanceId.HasValue)
        {
            var returnedSoFar = await _context.StockMovements
                .Where(m => !m.IsDeleted
                    && m.InventoryPartId == part.Id
                    && m.MovementType == StockMovementTypes.Return)
                .SumAsync(m => m.Quantity, cancellationToken);

            if (returnedSoFar + dto.Quantity > totals.Issued)
            {
                var left = totals.Issued - returnedSoFar;
                throw new InvalidOperationException(
                    left <= 0
                        ? "Nothing is out on this line, so there is nothing to return."
                        : $"Only {left:0.###} issued qty left to return on this line.");
            }
        }

        var entity = new StockMovement
        {
            InventoryPartId = part.Id,
            MovementType = type,
            Quantity = dto.Quantity,
            DamagedQuantity = damaged,
            Delta = delta,
            OccurredAt = dto.OccurredAt?.Date ?? DateTime.UtcNow.Date,
            SourceIssuanceId = sourceIssuanceId,
            EmployeeId = dto.EmployeeId,
            EmployeeName = employeeName,
            Reason = dto.Reason?.Trim() ?? string.Empty,
            Notes = dto.Notes?.Trim() ?? string.Empty,
            RecordedByUserId = recordedByUserId,
        };

        _context.Add(entity);
        // Touching the line makes the concurrency token fire if someone else moves stock at the same time.
        part.UpdatedAt = DateTime.UtcNow;
        await SaveGuardedAsync(cancellationToken);

        var mapped = await MapManyAsync(new[] { entity }, cancellationToken);
        return mapped.First();
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.StockMovements.FirstOrDefaultAsync(m => m.Id == id && !m.IsDeleted, cancellationToken);
        if (entity is null) return false;

        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
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

    private async Task<List<StockMovementDto>> MapManyAsync(
        IReadOnlyCollection<StockMovement> items,
        CancellationToken cancellationToken)
    {
        if (items.Count == 0)
            return new List<StockMovementDto>();

        var partIds = items.Select(m => m.InventoryPartId).Distinct().ToList();
        var parts = await _context.InventoryParts
            .Where(p => partIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, cancellationToken);

        var totals = await _balances.GetTotalsAsync(partIds, cancellationToken: cancellationToken);

        var userIds = items
            .Where(m => m.RecordedByUserId.HasValue)
            .Select(m => m.RecordedByUserId!.Value)
            .Distinct()
            .ToList();

        var users = userIds.Count == 0
            ? new Dictionary<Guid, string>()
            : (await _context.Users
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email })
                .ToListAsync(cancellationToken))
                .ToDictionary(
                    u => u.Id,
                    u =>
                    {
                        var name = $"{u.FirstName} {u.LastName}".Trim();
                        return string.IsNullOrWhiteSpace(name) ? u.Email : name;
                    });

        return items.Select(m =>
        {
            parts.TryGetValue(m.InventoryPartId, out var part);
            totals.TryGetValue(m.InventoryPartId, out var total);
            users.TryGetValue(m.RecordedByUserId ?? Guid.Empty, out var recordedBy);

            return new StockMovementDto
            {
                Id = m.Id,
                InventoryPartId = m.InventoryPartId,
                Item = part?.Item ?? string.Empty,
                Specification = part?.Specification ?? string.Empty,
                Supplier = part?.Supplier ?? string.Empty,
                MovementType = m.MovementType,
                Quantity = m.Quantity,
                DamagedQuantity = m.DamagedQuantity,
                Delta = m.Delta,
                OccurredAt = m.OccurredAt,
                SourceIssuanceId = m.SourceIssuanceId,
                EmployeeId = m.EmployeeId,
                EmployeeName = m.EmployeeName,
                Reason = m.Reason,
                Notes = m.Notes,
                RecordedByUserId = m.RecordedByUserId,
                RecordedByName = recordedBy ?? string.Empty,
                OnHandAfter = total.OnHandFrom(part?.Quantity ?? 0),
                CreatedAt = m.CreatedAt,
                UpdatedAt = m.UpdatedAt,
            };
        }).ToList();
    }
}
