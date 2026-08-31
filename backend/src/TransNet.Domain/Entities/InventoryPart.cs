using TransNet.Domain.Common;

namespace TransNet.Domain.Entities;

/// <summary>One line from the parts purchase register (Excel columns).</summary>
public class InventoryPart : BaseEntity
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
    /// <summary>Part, Charge, or Note.</summary>
    public string LineKind { get; set; } = "Part";
    public string Currency { get; set; } = "USD";
    public string Notes { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
