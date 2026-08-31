namespace TransNet.Application.DTOs.Clients;

public class ClientDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateClientDto
{
    public string Name { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
}

public class UpdateClientDto
{
    public string Name { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
}
