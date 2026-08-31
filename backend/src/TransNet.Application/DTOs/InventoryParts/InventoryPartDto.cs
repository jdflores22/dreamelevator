namespace TransNet.Application.DTOs.InventoryParts;

public class InventoryPartDto
{
    public Guid Id { get; set; }
    public DateTime? PurchasedAt { get; set; }
    public string Supplier { get; set; } = string.Empty;
    public string Item { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public decimal? Quantity { get; set; }
    public decimal IssuedQuantity { get; set; }
    public decimal ReturnedQuantity { get; set; }
    public decimal AdjustedQuantity { get; set; }
    public decimal OnHand { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }
    public decimal? AmountInPeso { get; set; }
    public string ProjectBuilding { get; set; } = string.Empty;
    public string LineKind { get; set; } = "Part";
    public string Currency { get; set; } = "USD";
    public string Notes { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpsertInventoryPartDto
{
    public DateTime? PurchasedAt { get; set; }
    public string Supplier { get; set; } = string.Empty;
    public string Item { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public decimal? Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }
    public decimal? AmountInPeso { get; set; }
    public string ProjectBuilding { get; set; } = string.Empty;
    public string LineKind { get; set; } = "Part";
    public string Currency { get; set; } = "USD";
    public string Notes { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; } = true;
}

public class InventoryNamedTotalDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal TotalUsd { get; set; }
    public decimal TotalPhp { get; set; }
    public int Count { get; set; }
    public decimal Quantity { get; set; }
}

public class InventoryDashboardDto
{
    public int TotalLines { get; set; }
    public int PartCount { get; set; }
    public int ChargeCount { get; set; }
    public int SupplierCount { get; set; }
    public decimal TotalQuantity { get; set; }
    public decimal TotalSpendUsd { get; set; }
    public decimal TotalSpendPhp { get; set; }
    public decimal AverageUnitPriceUsd { get; set; }
    public decimal AverageUnitPricePhp { get; set; }
    public decimal UsdToPhpRate { get; set; }
    public int PhpEnteredCount { get; set; }
    public int PhpEstimatedCount { get; set; }
    public int MissingPriceCount { get; set; }
    public int UnassignedProjectCount { get; set; }
    public decimal TotalIssuedQuantity { get; set; }
    public decimal TotalReturnedQuantity { get; set; }
    public decimal TotalAdjustedQuantity { get; set; }
    public int IssuanceCount { get; set; }
    public decimal TotalOnHandQuantity { get; set; }
    public int ZeroStockCount { get; set; }
    public List<InventoryNamedTotalDto> SpendBySupplier { get; set; } = new();
    public List<InventoryNamedTotalDto> SpendByMonth { get; set; } = new();
    public List<InventoryNamedTotalDto> TopItems { get; set; } = new();
    public List<InventoryPartDto> Recent { get; set; } = new();
    public List<InventoryIssuanceDto> RecentIssuances { get; set; } = new();
}

public class InventoryFiltersDto
{
    public List<string> Suppliers { get; set; } = new();
    public List<string> Projects { get; set; } = new();
    public List<string> LineKinds { get; set; } = new();
}
