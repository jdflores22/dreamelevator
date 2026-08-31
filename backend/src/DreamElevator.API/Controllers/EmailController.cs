using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Settings;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route("api/v1/email")]
[Authorize(Roles = ApiConstants.AdminRoles)]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ISmtpSettingsProvider _smtpSettings;

    public EmailController(IEmailService emailService, ISmtpSettingsProvider smtpSettings)
    {
        _emailService = emailService;
        _smtpSettings = smtpSettings;
    }

    [HttpGet("status")]
    public async Task<ActionResult<ApiResponse<EmailStatusDto>>> GetStatus(CancellationToken cancellationToken)
    {
        var config = await _emailService.GetConfigurationStatusAsync(cancellationToken);
        var settings = await _smtpSettings.GetAsync(cancellationToken);

        return Ok(ApiResponse<EmailStatusDto>.Ok(new EmailStatusDto
        {
            IsConfigured = config.IsConfigured,
            Provider = config.Provider,
            Host = config.Host,
            Port = config.Port,
            From = config.From,
            Username = config.Username,
            EnableSsl = config.EnableSsl,
            CompanyEmail = settings.CompanyEmail,
            ConfigurationHint = config.ConfigurationHint,
            ConfigSource = config.ConfigSource,
            UsesContactEmailAsLogin = config.UsesContactEmailAsLogin,
            HasPassword = config.HasPassword,
            HasApiToken = config.HasApiToken,
        }));
    }

    [HttpPost("test")]
    public async Task<ActionResult<ApiResponse<EmailTestResultDto>>> SendTest(
        [FromBody] SendTestEmailDto? dto,
        CancellationToken cancellationToken)
    {
        var settings = await _smtpSettings.GetAsync(cancellationToken);
        var to = string.IsNullOrWhiteSpace(dto?.To) ? settings.CompanyEmail : dto!.To.Trim();

        if (string.IsNullOrWhiteSpace(to))
        {
            return BadRequest(ApiResponse<EmailTestResultDto>.Fail("No recipient email. Set the contact email in Admin → Settings → Contact."));
        }

        var result = await _emailService.SendAsync(
            to,
            "DreamElevator test email",
            "<p>This is a test message from the DreamElevator admin panel.</p><p>If you received this, SMTP is configured correctly.</p>",
            cancellationToken);

        var response = new EmailTestResultDto
        {
            To = to,
            Outcome = result.Outcome.ToString(),
            Success = result.IsSent,
            Message = result.Outcome switch
            {
                EmailSendOutcome.Sent => $"Test email sent to {to}.",
                EmailSendOutcome.SkippedNotConfigured => result.Error ?? "SMTP is not configured.",
                EmailSendOutcome.Failed => result.Error ?? "SMTP send failed.",
                _ => "Unknown result.",
            },
        };

        return Ok(ApiResponse<EmailTestResultDto>.Ok(response));
    }
}
