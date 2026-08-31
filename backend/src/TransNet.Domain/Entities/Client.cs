using TransNet.Domain.Common;

namespace TransNet.Domain.Entities;

public class Client : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
}
