namespace TransNet.Application.DTOs.Auth;

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
