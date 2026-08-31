using TransNet.Domain.Common;

namespace TransNet.Domain.Entities;

/// <summary>Staff profile used as the recipient on inventory stock-outs.</summary>
public class Employee : BaseEntity
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

    /// <summary>Optional link to a login account when the employee also uses the system.</summary>
    public Guid? UserId { get; set; }

    public string FullName => $"{FirstName} {LastName}".Trim();
}
