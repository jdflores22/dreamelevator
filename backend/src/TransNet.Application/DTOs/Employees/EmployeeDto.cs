using TransNet.Application.DTOs.InventoryParts;

namespace TransNet.Application.DTOs.Employees;

public class EmployeeDto
{
    public Guid Id { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public DateTime? HiredAt { get; set; }
    public string Notes { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public Guid? UserId { get; set; }
    public bool IsPublished { get; set; }

    /// <summary>Stock-out activity for this employee.</summary>
    public int IssuanceCount { get; set; }
    public decimal TotalQuantityIssued { get; set; }
    public DateTime? LastIssuedAt { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpsertEmployeeDto
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string PhotoUrl { get; set; } = string.Empty;
    public DateTime? HiredAt { get; set; }
    public string Notes { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public Guid? UserId { get; set; }
    public bool IsPublished { get; set; } = true;
}

/// <summary>Employee profile plus the items they received.</summary>
public class EmployeeProfileDto
{
    public EmployeeDto Employee { get; set; } = new();
    public List<InventoryIssuanceDto> Issuances { get; set; } = new();
    public List<EmployeeItemTotalDto> TopItems { get; set; } = new();
}

public class EmployeeItemTotalDto
{
    public string Item { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public int Count { get; set; }
}
