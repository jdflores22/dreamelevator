using TransNet.Domain.Common;

namespace TransNet.Domain.Entities;

/// <summary>Stock-out / issuance of inventory parts to a recipient and destination.</summary>
public class InventoryIssuance : BaseEntity
{
    public Guid? InventoryPartId { get; set; }
    public InventoryPart? InventoryPart { get; set; }

    public string Item { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public DateTime? IssuedAt { get; set; }

    public Guid? ReceivedByEmployeeId { get; set; }
    public Employee? ReceivedByEmployee { get; set; }
    /// <summary>Legacy recipient link to a login account, kept for older records.</summary>
    public Guid? ReceivedByUserId { get; set; }
    public string ReceivedByName { get; set; } = string.Empty;
    /// <summary>Position snapshot so the slip still reads correctly after a role change.</summary>
    public string ReceivedByPosition { get; set; } = string.Empty;

    public Guid? ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ProjectBuilding { get; set; } = string.Empty;

    public string Purpose { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;

    public Guid? IssuedByUserId { get; set; }
}
