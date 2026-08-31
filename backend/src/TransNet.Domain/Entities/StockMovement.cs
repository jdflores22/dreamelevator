using TransNet.Domain.Common;

namespace TransNet.Domain.Entities;

/// <summary>
/// Ledger row for stock changes that are not a purchase or a stock-out:
/// returns from the field, damage, loss, and physical-count corrections.
/// </summary>
public class StockMovement : BaseEntity
{
    public Guid InventoryPartId { get; set; }
    public InventoryPart? InventoryPart { get; set; }

    /// <summary>Return, Damage, Loss, or Adjustment.</summary>
    public string MovementType { get; set; } = StockMovementTypes.Return;

    /// <summary>Always positive — how many pieces the movement covers.</summary>
    public decimal Quantity { get; set; }

    /// <summary>
    /// Of <see cref="Quantity"/>, how many came back unusable. Those pieces already left
    /// stock on the stock-out, so they are written off instead of added back.
    /// </summary>
    public decimal DamagedQuantity { get; set; }

    /// <summary>Signed effect on hand. Returns and found stock add, damage and loss subtract.</summary>
    public decimal Delta { get; set; }

    public DateTime? OccurredAt { get; set; }

    /// <summary>Set when the movement reverses a specific stock-out.</summary>
    public Guid? SourceIssuanceId { get; set; }
    public InventoryIssuance? SourceIssuance { get; set; }

    public Guid? EmployeeId { get; set; }
    public Employee? Employee { get; set; }
    public string EmployeeName { get; set; } = string.Empty;

    public string Reason { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public Guid? RecordedByUserId { get; set; }
}

public static class StockMovementTypes
{
    public const string Return = "Return";
    public const string Damage = "Damage";
    public const string Loss = "Loss";
    public const string Adjustment = "Adjustment";

    public static readonly string[] All = { Return, Damage, Loss, Adjustment };

    /// <summary>Adjustment is the only type that can go either way.</summary>
    public static bool IsIncrease(string type) => type == Return;

    public static bool IsValid(string type) => All.Contains(type);
}
