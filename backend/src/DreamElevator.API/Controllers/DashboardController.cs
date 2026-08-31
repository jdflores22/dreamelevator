using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Dashboard;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
[Authorize(Roles = ApiConstants.AdminRoles)]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _service;

    public DashboardController(IDashboardService service) => _service = service;

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<DashboardStatsDto>>> GetStats()
    {
        var stats = await _service.GetStatsAsync();
        return Ok(ApiResponse<DashboardStatsDto>.Ok(stats));
    }
}
