using TransNet.Domain.Enums;

namespace TransNet.Domain.Entities;

public class ContactMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    /// <summary>Who is reaching out: building_owner, contractor, facility, other.</summary>
    public string SenderType { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public MessageStatus Status { get; set; } = MessageStatus.New;
    public Guid? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
