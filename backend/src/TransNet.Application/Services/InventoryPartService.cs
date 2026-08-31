using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Application.DTOs.InventoryParts;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class InventoryPartService : IInventoryPartService
{
    private static readonly HashSet<string> AllowedKinds = new(StringComparer.OrdinalIgnoreCase)
    {
        "Part", "Charge", "Note"
    };

    private readonly IApplicationDbContext _context;
    private readonly IStockBalanceService _balances;

    public InventoryPartService(IApplicationDbContext context, IStockBalanceService balances)
    {
        _context = context;
        _balances = balances;
    }

    public async Task<(List<InventoryPartDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        string? supplier,
        string? project,
        string? lineKind,
        DateTime? from,
        DateTime? to,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var query = ApplyFilters(_context.InventoryParts.Where(p => !p.IsDeleted), search, supplier, project, lineKind, from, to)
            .OrderByDescending(p => p.PurchasedAt)
            .ThenBy(p => p.SortOrder)
            .ThenBy(p => p.Item);

        var (items, meta) = await QueryExtensions.ToPagedListAsync(query, page, pageSize, cancellationToken);
        var totalsMap = await _balances.GetTotalsAsync(items.Select(i => i.Id), cancellationToken: cancellationToken);
        return (items.Select(p => Map(p, TotalsOf(totalsMap, p.Id))).ToList(), meta);
    }

    public async Task<InventoryPartDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.InventoryParts.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
        if (entity is null) return null;
        var totals = await _balances.GetTotalsAsync(entity.Id, cancellationToken: cancellationToken);
        return Map(entity, totals);
    }

    public async Task<InventoryPartDto> CreateAsync(UpsertInventoryPartDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new InventoryPart();
        Apply(entity, dto);
        _context.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<InventoryPartDto?> UpdateAsync(Guid id, UpsertInventoryPartDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.InventoryParts.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
        if (entity is null) return null;

        Apply(entity, dto);
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        var totals = await _balances.GetTotalsAsync(entity.Id, cancellationToken: cancellationToken);
        return Map(entity, totals);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.InventoryParts.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
        if (entity is null) return false;

        entity.IsDeleted = true;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<InventoryDashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.InventoryParts
            .Where(p => !p.IsDeleted && p.IsPublished)
            .OrderByDescending(p => p.PurchasedAt)
            .ThenBy(p => p.SortOrder)
            .ToListAsync(cancellationToken);

        var parts = rows.Where(p => p.LineKind.Equals("Part", StringComparison.OrdinalIgnoreCase)).ToList();
        const decimal rate = 58m;
        var priced = rows.Where(p => p.UnitPrice is > 0).ToList();
        var phpEntered = rows.Count(HasEnteredPeso);
        var spendUsd = rows.Sum(UsdOf);
        var spendPhp = rows.Sum(p => PhpOf(p, rate));

        InventoryNamedTotalDto Named(string name, IEnumerable<InventoryPart> group)
        {
            var list = group.ToList();
            var usd = list.Sum(UsdOf);
            var php = list.Sum(p => PhpOf(p, rate));
            return new InventoryNamedTotalDto
            {
                Name = name,
                Total = php,
                TotalUsd = usd,
                TotalPhp = php,
                Count = list.Count,
                Quantity = list.Sum(p => p.Quantity ?? 0)
            };
        }

        var byMonth = rows
            .Where(p => p.PurchasedAt.HasValue)
            .GroupBy(p => new DateTime(p.PurchasedAt!.Value.Year, p.PurchasedAt.Value.Month, 1))
            .ToDictionary(g => g.Key, g => g.ToList());

        var spendByMonth = new List<InventoryNamedTotalDto>();
        if (byMonth.Count > 0)
        {
            var cursor = byMonth.Keys.Min();
            var last = byMonth.Keys.Max();
            while (cursor <= last)
            {
                byMonth.TryGetValue(cursor, out var group);
                spendByMonth.Add(Named(cursor.ToString("yyyy-MM"), group ?? new List<InventoryPart>()));
                cursor = cursor.AddMonths(1);
            }
        }

        var issuances = await _context.InventoryIssuances
            .Where(i => !i.IsDeleted && i.IsPublished)
            .OrderByDescending(i => i.IssuedAt)
            .ThenByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);

        var totalsByPart = await _balances.GetTotalsAsync(parts.Select(p => p.Id), cancellationToken: cancellationToken);

        var totalPurchasedQty = parts.Sum(p => p.Quantity ?? 0);
        var totalIssuedQty = issuances.Sum(i => i.Quantity);
        var zeroStock = parts.Count(p => TotalsOf(totalsByPart, p.Id).OnHandFrom(p.Quantity ?? 0) <= 0);
        var totalReturnedQty = totalsByPart.Values.Sum(t => t.Returned);
        var totalAdjustedQty = totalsByPart.Values.Sum(t => t.Adjusted);

        var issuerIds = issuances
            .SelectMany(i => new Guid?[] { i.IssuedByUserId })
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .Distinct()
            .ToList();
        var issuerNames = issuerIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await _context.Users
                .Where(u => issuerIds.Contains(u.Id))
                .ToDictionaryAsync(
                    u => u.Id,
                    u =>
                    {
                        var name = $"{u.FirstName} {u.LastName}".Trim();
                        return string.IsNullOrWhiteSpace(name) ? u.Email : name;
                    },
                    cancellationToken);

        return new InventoryDashboardDto
        {
            TotalLines = rows.Count,
            PartCount = parts.Count,
            ChargeCount = rows.Count(p => p.LineKind.Equals("Charge", StringComparison.OrdinalIgnoreCase)),
            SupplierCount = rows.Select(p => p.Supplier.Trim()).Where(s => s.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase).Count(),
            TotalQuantity = totalPurchasedQty,
            TotalSpendUsd = spendUsd,
            TotalSpendPhp = spendPhp,
            AverageUnitPriceUsd = priced.Count == 0 ? 0 : decimal.Round(priced.Average(p => p.UnitPrice!.Value), 2),
            AverageUnitPricePhp = priced.Count == 0
                ? 0
                : decimal.Round(priced.Average(p =>
                    HasEnteredPeso(p) && p.Quantity is > 0
                        ? p.AmountInPeso!.Value / p.Quantity.Value
                        : p.UnitPrice!.Value * rate), 2),
            UsdToPhpRate = rate,
            PhpEnteredCount = phpEntered,
            PhpEstimatedCount = rows.Count(p => UsdOf(p) > 0 && !HasEnteredPeso(p)),
            MissingPriceCount = parts.Count(p => p.TotalPrice is null && p.UnitPrice is null && p.AmountInPeso is null),
            UnassignedProjectCount = parts.Count(p => string.IsNullOrWhiteSpace(p.ProjectBuilding)),
            TotalIssuedQuantity = totalIssuedQty,
            TotalReturnedQuantity = totalReturnedQty,
            TotalAdjustedQuantity = totalAdjustedQty,
            IssuanceCount = issuances.Count,
            TotalOnHandQuantity = parts.Sum(p =>
                Math.Max(0, TotalsOf(totalsByPart, p.Id).OnHandFrom(p.Quantity ?? 0))),
            ZeroStockCount = zeroStock,
            SpendBySupplier = rows
                .Where(p => !string.IsNullOrWhiteSpace(p.Supplier))
                .GroupBy(p => p.Supplier.Trim(), StringComparer.OrdinalIgnoreCase)
                .Select(g => Named(g.First().Supplier.Trim(), g))
                .OrderByDescending(x => x.TotalUsd)
                .ToList(),
            SpendByMonth = spendByMonth,
            TopItems = parts
                .Where(p => !string.IsNullOrWhiteSpace(p.Item))
                .GroupBy(p => p.Item.Trim(), StringComparer.OrdinalIgnoreCase)
                .Select(g => Named(g.First().Item.Trim(), g))
                .OrderByDescending(x => x.Quantity)
                .ThenByDescending(x => x.TotalUsd)
                .Take(8)
                .ToList(),
            Recent = rows.Take(8).Select(p => Map(p, TotalsOf(totalsByPart, p.Id))).ToList(),
            RecentIssuances = issuances.Take(6).Select(i =>
            {
                issuerNames.TryGetValue(i.IssuedByUserId ?? Guid.Empty, out var issuedBy);
                return new InventoryIssuanceDto
                {
                    Id = i.Id,
                    InventoryPartId = i.InventoryPartId,
                    Item = i.Item,
                    Specification = i.Specification,
                    Quantity = i.Quantity,
                    IssuedAt = i.IssuedAt,
                    ReceivedByUserId = i.ReceivedByUserId,
                    ReceivedByName = i.ReceivedByName,
                    ClientId = i.ClientId,
                    ClientName = i.ClientName,
                    ProjectBuilding = i.ProjectBuilding,
                    Purpose = i.Purpose,
                    Notes = i.Notes,
                    IssuedByUserId = i.IssuedByUserId,
                    IssuedByName = issuedBy ?? string.Empty,
                    IsPublished = i.IsPublished,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                };
            }).ToList(),
        };
    }

    public async Task<InventoryFiltersDto> GetFiltersAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _context.InventoryParts
            .Where(p => !p.IsDeleted)
            .Select(p => new { p.Supplier, p.ProjectBuilding, p.LineKind })
            .ToListAsync(cancellationToken);

        // Master list first so a brand-new supplier is selectable before it has any lines.
        var masterSuppliers = await _context.Suppliers
            .Where(s => !s.IsDeleted && s.IsPublished)
            .Select(s => s.Name)
            .ToListAsync(cancellationToken);

        return new InventoryFiltersDto
        {
            Suppliers = masterSuppliers
                .Concat(rows.Select(r => r.Supplier))
                .Select(s => s.Trim())
                .Where(s => s.Length > 0)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(s => s)
                .ToList(),
            Projects = rows.Select(r => r.ProjectBuilding.Trim()).Where(s => s.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(s => s).ToList(),
            LineKinds = new List<string> { "Part", "Charge", "Note" }
        };
    }

    private static IQueryable<InventoryPart> ApplyFilters(
        IQueryable<InventoryPart> query,
        string? search,
        string? supplier,
        string? project,
        string? lineKind,
        DateTime? from,
        DateTime? to)
    {
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(p =>
                p.Item.Contains(term) ||
                p.Specification.Contains(term) ||
                p.Supplier.Contains(term) ||
                p.ProjectBuilding.Contains(term) ||
                p.Notes.Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(supplier))
            query = query.Where(p => p.Supplier == supplier);

        if (!string.IsNullOrWhiteSpace(project))
            query = query.Where(p => p.ProjectBuilding == project);

        if (!string.IsNullOrWhiteSpace(lineKind))
            query = query.Where(p => p.LineKind == lineKind);

        if (from.HasValue)
            query = query.Where(p => p.PurchasedAt >= from.Value.Date);

        if (to.HasValue)
            query = query.Where(p => p.PurchasedAt < to.Value.Date.AddDays(1));

        return query;
    }

    private static void Apply(InventoryPart entity, UpsertInventoryPartDto dto)
    {
        var kind = string.IsNullOrWhiteSpace(dto.LineKind) ? "Part" : dto.LineKind.Trim();
        if (!AllowedKinds.Contains(kind))
            kind = "Part";

        var total = dto.TotalPrice;
        if (total is null && dto.Quantity is not null && dto.UnitPrice is not null)
            total = decimal.Round(dto.Quantity.Value * dto.UnitPrice.Value, 2);

        entity.PurchasedAt = dto.PurchasedAt?.Date;
        entity.Supplier = dto.Supplier?.Trim() ?? string.Empty;
        entity.Item = dto.Item?.Trim() ?? string.Empty;
        entity.Specification = dto.Specification?.Trim() ?? string.Empty;
        entity.Quantity = dto.Quantity;
        entity.UnitPrice = dto.UnitPrice;
        entity.TotalPrice = total;
        entity.AmountInPeso = dto.AmountInPeso;
        entity.ProjectBuilding = dto.ProjectBuilding?.Trim() ?? string.Empty;
        entity.LineKind = kind;
        entity.Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "USD" : dto.Currency.Trim().ToUpperInvariant();
        entity.Notes = dto.Notes?.Trim() ?? string.Empty;
        entity.SortOrder = dto.SortOrder;
        entity.IsPublished = dto.IsPublished;
    }

    private static decimal UsdOf(InventoryPart part) => part.TotalPrice ?? 0;

    /// <summary>
    /// Use the peso column when it is a real conversion. Copied USD amounts (same number)
    /// are treated as missing and converted at the FX rate.
    /// </summary>
    private static bool HasEnteredPeso(InventoryPart part) =>
        part.AmountInPeso is > 0 && part.AmountInPeso != part.TotalPrice;

    private static decimal PhpOf(InventoryPart part, decimal rate)
    {
        if (HasEnteredPeso(part))
            return part.AmountInPeso!.Value;
        return part.TotalPrice is > 0 ? decimal.Round(part.TotalPrice.Value * rate, 2) : 0;
    }

    private static StockLedgerTotals TotalsOf(
        IReadOnlyDictionary<Guid, StockLedgerTotals> byPart,
        Guid partId) =>
        byPart.TryGetValue(partId, out var totals) ? totals : default;

    private static InventoryPartDto Map(InventoryPart entity, StockLedgerTotals totals = default)
    {
        var purchased = entity.Quantity ?? 0;
        return new()
        {
            Id = entity.Id,
            PurchasedAt = entity.PurchasedAt,
            Supplier = entity.Supplier,
            Item = entity.Item,
            Specification = entity.Specification,
            Quantity = entity.Quantity,
            IssuedQuantity = totals.Issued,
            ReturnedQuantity = totals.Returned,
            AdjustedQuantity = totals.Adjusted,
            OnHand = totals.OnHandFrom(purchased),
            UnitPrice = entity.UnitPrice,
            TotalPrice = entity.TotalPrice,
            AmountInPeso = entity.AmountInPeso,
            ProjectBuilding = entity.ProjectBuilding,
            LineKind = entity.LineKind,
            Currency = entity.Currency,
            Notes = entity.Notes,
            SortOrder = entity.SortOrder,
            IsPublished = entity.IsPublished,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
