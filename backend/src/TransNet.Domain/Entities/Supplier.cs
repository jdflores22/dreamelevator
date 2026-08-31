using TransNet.Domain.Common;

namespace TransNet.Domain.Entities;

/// <summary>Master list of parts suppliers. Register lines keep the name as a snapshot.</summary>
public class Supplier : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ContactPerson { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
