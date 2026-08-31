namespace TransNet.Application.Interfaces;

/// <summary>Ledger totals for one register line, excluding the purchased quantity.</summary>
public readonly record struct StockLedgerTotals(
    decimal Issued,
    decimal Returned,
    decimal Adjusted,
    decimal Damaged = 0)
{
    /// <summary>Net effect of everything recorded after the purchase.</summary>
    public decimal Delta => Returned + Adjusted - Issued;

    public decimal OnHandFrom(decimal purchased) => purchased + Delta;
}

/// <summary>
/// Single source of truth for stock math. On hand is always
/// purchased − issued + returned ± adjustments.
/// </summary>
public interface IStockBalanceService
{
    Task<Dictionary<Guid, StockLedgerTotals>> GetTotalsAsync(
        IEnumerable<Guid> partIds,
        Guid? excludeIssuanceId = null,
        CancellationToken cancellationToken = default);

    Task<StockLedgerTotals> GetTotalsAsync(
        Guid partId,
        Guid? excludeIssuanceId = null,
        CancellationToken cancellationToken = default);
}
