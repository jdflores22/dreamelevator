using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.SiteStats;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class SiteStatsController : ControllerBase
{
    private readonly ISiteStatService _service;

    public SiteStatsController(ISiteStatService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var (items, meta) = await _service.GetAllAsync(IsAdmin(), page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<SiteStatDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id, IsAdmin());
        return item is null ? NotFound(ApiResponse<SiteStatDto>.Fail("Stat not found")) : Ok(ApiResponse<SiteStatDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<SiteStatDto>>> Create([FromBody] CreateSiteStatDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<SiteStatDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<SiteStatDto>>> Update(Guid id, [FromBody] UpdateSiteStatDto dto)
    {
        var item = await _service.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<SiteStatDto>.Fail("Stat not found")) : Ok(ApiResponse<SiteStatDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Stat not found"));
    }

    private bool IsAdmin() => User.IsInRole("SuperAdmin") || User.IsInRole("Editor");
}
