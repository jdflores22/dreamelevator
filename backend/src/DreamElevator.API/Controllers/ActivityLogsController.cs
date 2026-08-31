using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.ActivityLogs;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
[Authorize(Roles = ApiConstants.AdminRoles)]
public class ActivityLogsController : ControllerBase
{
    private readonly IActivityLogService _service;

    public ActivityLogsController(IActivityLogService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ActivityLogDto>>>> GetLogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        [FromQuery] string? search = null)
    {
        var (items, meta) = await _service.GetLogsAsync(page, pageSize, search);
        return Ok(ApiResponse<List<ActivityLogDto>>.Ok(items, meta));
    }
}
