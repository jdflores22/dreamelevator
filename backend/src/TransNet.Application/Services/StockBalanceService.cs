using Microsoft.EntityFrameworkCore;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class StockBalanceService : IStockBalanceService
{
    private readonly IApplicationDbContext _context;

    public StockBalanceService(IApplicationDbContext context) => _context = context;

    public async Task<Dictionary<Guid, StockLedgerTotals>> GetTotalsAsync(
        IEnumerable<Guid> partIds,
        Guid? excludeIssuanceId = null,
        CancellationToken cancellationToken = default)
    {
        var ids = partIds.Distinct().ToList();
        if (ids.Count == 0)
            return new Dictionary<Guid, StockLedgerTotals>();

        var issuedQuery = _context.InventoryIssuances
            .Where(i => !i.IsDeleted && i.InventoryPartId != null && ids.Contains(i.InventoryPartId.Value));

        if (excludeIssuanceId.HasValue)
            issuedQuery = issuedQuery.Where(i => i.Id != excludeIssuanceId.Value);

        var issued = await issuedQuery
            .GroupBy(i => i.InventoryPartId!.Value)
            .Select(g => new { PartId = g.Key, Qty = g.Sum(x => x.Quantity) })
            .ToDictionaryAsync(x => x.PartId, x => x.Qty, cancellationToken);

        var movements = await _context.StockMovements
            .Where(m => !m.IsDeleted && ids.Contains(m.InventoryPartId))
            .GroupBy(m => new { m.InventoryPartId, IsReturn = m.MovementType == StockMovementTypes.Return })
            .Select(g => new
            {
                g.Key.InventoryPartId,
                g.Key.IsReturn,
                Delta = g.Sum(x => x.Delta),
                Damaged = g.Sum(x => x.DamagedQuantity),
            })
            .ToListAsync(cancellationToken);

        return ids.ToDictionary(
            id => id,
            id =>
            {
                var mine = movements.Where(m => m.InventoryPartId == id).ToList();
                var writeOffs = mine.Where(m => !m.IsReturn).Sum(m => -m.Delta);
                return new StockLedgerTotals(
                    Issued: issued.TryGetValue(id, out var qty) ? qty : 0,
                    Returned: mine.Where(m => m.IsReturn).Sum(m => m.Delta),
                    Adjusted: mine.Where(m => !m.IsReturn).Sum(m => m.Delta),
                    // Damage recorded on a return plus stand-alone write-offs.
                    Damaged: mine.Sum(m => m.Damaged) + Math.Max(0, writeOffs));
            });
    }

    public async Task<StockLedgerTotals> GetTotalsAsync(
        Guid partId,
        Guid? excludeIssuanceId = null,
        CancellationToken cancellationToken = default)
    {
        var totals = await GetTotalsAsync(new[] { partId }, excludeIssuanceId, cancellationToken);
        return totals.TryGetValue(partId, out var value) ? value : default;
    }
}
