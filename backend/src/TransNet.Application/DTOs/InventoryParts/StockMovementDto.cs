namespace TransNet.Application.DTOs.InventoryParts;

public class StockMovementDto
{
    public Guid Id { get; set; }
    public Guid InventoryPartId { get; set; }
    public string Item { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
    public string MovementType { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    /// <summary>Of the returned pieces, how many came back unusable.</summary>
    public decimal DamagedQuantity { get; set; }
    /// <summary>Signed effect on hand: positive adds stock back, negative takes it out.</summary>
    public decimal Delta { get; set; }
    public DateTime? OccurredAt { get; set; }
    public Guid? SourceIssuanceId { get; set; }
    public Guid? EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public Guid? RecordedByUserId { get; set; }
    public string RecordedByName { get; set; } = string.Empty;
    public decimal OnHandAfter { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpsertStockMovementDto
{
    public Guid InventoryPartId { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    /// <summary>Only used by Return: how many of the returned pieces are unusable.</summary>
    public decimal DamagedQuantity { get; set; }
    /// <summary>Only used by Adjustment, which can go either way.</summary>
    public bool Increase { get; set; }
    public DateTime? OccurredAt { get; set; }
    public Guid? SourceIssuanceId { get; set; }
    public Guid? EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

/// <summary>Every stock event for one register line, oldest first, with a running balance.</summary>
public class StockLedgerDto
{
    public Guid InventoryPartId { get; set; }
    public string Item { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
    public decimal PurchasedQuantity { get; set; }
    public decimal IssuedQuantity { get; set; }
    public decimal ReturnedQuantity { get; set; }
    public decimal AdjustedQuantity { get; set; }
    public decimal DamagedQuantity { get; set; }
    public decimal OnHand { get; set; }
    public List<StockLedgerEntryDto> Entries { get; set; } = new();
}

public class StockLedgerEntryDto
{
    public Guid Id { get; set; }
    public string Kind { get; set; } = string.Empty;
    public DateTime? OccurredAt { get; set; }
    public decimal Delta { get; set; }
    public decimal Balance { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}
