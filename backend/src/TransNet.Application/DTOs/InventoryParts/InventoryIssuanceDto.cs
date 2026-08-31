namespace TransNet.Application.DTOs.InventoryParts;

public class InventoryIssuanceDto
{
    public Guid Id { get; set; }
    public Guid? InventoryPartId { get; set; }
    public string Item { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public DateTime? IssuedAt { get; set; }
    public Guid? ReceivedByEmployeeId { get; set; }
    public Guid? ReceivedByUserId { get; set; }
    public string ReceivedByName { get; set; } = string.Empty;
    public string ReceivedByPosition { get; set; } = string.Empty;
    public string ReceivedByCode { get; set; } = string.Empty;
    public string ReceivedByDepartment { get; set; } = string.Empty;
    public string ReceivedByPhotoUrl { get; set; } = string.Empty;
    public Guid? ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ProjectBuilding { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public Guid? IssuedByUserId { get; set; }
    public string IssuedByName { get; set; } = string.Empty;
    public decimal? OnHandAfter { get; set; }
    /// <summary>Pieces already settled against this stock-out: returned, damaged, or written off as lost.</summary>
    public decimal ReturnedQuantity { get; set; }
    public decimal ReturnableQuantity { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpsertInventoryIssuanceDto
{
    public Guid? InventoryPartId { get; set; }
    public string Item { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public DateTime? IssuedAt { get; set; }
    public Guid? ReceivedByEmployeeId { get; set; }
    public Guid? ReceivedByUserId { get; set; }
    public string ReceivedByName { get; set; } = string.Empty;
    public Guid? ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ProjectBuilding { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public bool IsPublished { get; set; } = true;
}

public class InventoryAvailablePartDto
{
    public Guid Id { get; set; }
    public string Item { get; set; } = string.Empty;
    public string Specification { get; set; } = string.Empty;
    public string Supplier { get; set; } = string.Empty;
    public string ProjectBuilding { get; set; } = string.Empty;
    public DateTime? PurchasedAt { get; set; }
    public decimal PurchasedQuantity { get; set; }
    public decimal IssuedQuantity { get; set; }
    public decimal OnHand { get; set; }
}

public class InventoryIssuanceOptionsDto
{
    /// <summary>Legacy login-account recipients, kept so old records stay editable.</summary>
    public List<InventoryRecipientOptionDto> Recipients { get; set; } = new();
    public List<InventoryEmployeeOptionDto> Employees { get; set; } = new();
    public List<InventoryAvailablePartDto> AvailableParts { get; set; } = new();
}

public class InventoryRecipientOptionDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class InventoryEmployeeOptionDto
{
    public Guid Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
}

public class InventoryAvailabilityDto
{
    public Guid InventoryPartId { get; set; }
    public decimal PurchasedQuantity { get; set; }
    public decimal IssuedQuantity { get; set; }
    public decimal ReturnedQuantity { get; set; }
    public decimal AdjustedQuantity { get; set; }
    public decimal OnHand { get; set; }
}
