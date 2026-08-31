namespace TransNet.Application.DTOs.Suppliers;

public class SupplierDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }
    /// <summary>How many register lines currently use this supplier name.</summary>
    public int LineCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpsertSupplierDto
{
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; } = true;
}
