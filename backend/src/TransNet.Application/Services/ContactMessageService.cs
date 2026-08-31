using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Messages;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class ContactMessageService : IContactMessageService
{
    private readonly IApplicationDbContext _context;
    private readonly IEmailService _emailService;

    public ContactMessageService(IApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<(List<ContactMessageDto> Items, ResponseMeta Meta)> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var query = _context.ContactMessages.Include(m => m.AssignedTo).OrderByDescending(m => m.CreatedAt);
        var (items, meta) = await QueryExtensions.ToPagedListAsync(query, page, pageSize, cancellationToken);
        return (items.Select(Map).ToList(), meta);
    }

    public async Task<ContactMessageDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.ContactMessages.Include(m => m.AssignedTo)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    private static readonly HashSet<string> AllowedSenderTypes = new(StringComparer.Ordinal)
    {
        "building_owner",
        "contractor",
        "facility",
        "other",
        "trucker",
        "shipping_lines",
        "container_yard",
        "private_company",
    };

    public async Task<ContactMessageDto> CreateAsync(CreateContactMessageDto dto, CancellationToken cancellationToken = default)
    {
        var senderType = dto.SenderType?.Trim() ?? string.Empty;
        if (!AllowedSenderTypes.Contains(senderType))
            throw new ArgumentException("Invalid sender type.");

        var companyName = dto.CompanyName?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(companyName))
            throw new ArgumentException("Building or company name is required.");

        var entity = new ContactMessage
        {
            Name = dto.Name,
            Email = dto.Email,
            CompanyName = companyName,
            SenderType = senderType,
            Subject = dto.Subject,
            Body = dto.Body
        };
        _context.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        await _emailService.SendAsync(
            dto.Email,
            "We received your message",
            $"Thank you {dto.Name}, we have received your message and will respond shortly.",
            cancellationToken);

        var adminEmail = await SiteSettingsReader.GetCompanyEmailAsync(_context, cancellationToken);
        var senderLabel = FormatSenderType(entity.SenderType);

        await _emailService.SendAsync(
            adminEmail,
            $"New contact message from {dto.Name}",
            $"<p><strong>{dto.Name}</strong> ({dto.Email}) submitted a message.</p>" +
            $"<p><strong>Building / company:</strong> {companyName}</p>" +
            $"<p><strong>Sender type:</strong> {senderLabel}</p>" +
            $"<p><strong>Subject:</strong> {dto.Subject}</p><p>{dto.Body}</p>",
            cancellationToken);

        return Map(entity);
    }

    public async Task<ContactMessageDto?> UpdateAsync(Guid id, UpdateContactMessageDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.ContactMessages.Include(m => m.AssignedTo)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        if (entity is null) return null;

        entity.Status = dto.Status;
        entity.AssignedToId = dto.AssignedToId;
        await _context.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.ContactMessages.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        if (entity is null) return false;

        _context.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string FormatSenderType(string? value) => value switch
    {
        "building_owner" => "Building owner / property manager",
        "contractor" => "Contractor / developer",
        "facility" => "Facility or maintenance team",
        "other" => "Other",
        "trucker" => "Trucker",
        "shipping_lines" => "Shipping Lines",
        "container_yard" => "Container Yard",
        "private_company" => "Private Company",
        _ => string.IsNullOrWhiteSpace(value) ? "Not specified" : value,
    };

    private static ContactMessageDto Map(ContactMessage entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Email = entity.Email,
        CompanyName = entity.CompanyName,
        SenderType = entity.SenderType,
        Subject = entity.Subject,
        Body = entity.Body,
        Status = entity.Status,
        AssignedToId = entity.AssignedToId,
        AssignedToName = entity.AssignedTo is null ? null : $"{entity.AssignedTo.FirstName} {entity.AssignedTo.LastName}".Trim(),
        CreatedAt = entity.CreatedAt
    };
}
