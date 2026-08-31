using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Settings;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class SettingsController : ControllerBase
{
    private readonly ISiteSettingService _service;

    public SettingsController(ISiteSettingService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync(IsAdmin());
        return ApiResults.OkData(this, items);
    }

    [HttpGet("key/{key}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<SiteSettingDto>>> GetByKey(string key)
    {
        var item = await _service.GetByKeyAsync(key, IsAdmin());
        return item is null ? NotFound(ApiResponse<SiteSettingDto>.Fail("Setting not found")) : Ok(ApiResponse<SiteSettingDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<SiteSettingDto>>> Create([FromBody] CreateSiteSettingDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return Ok(ApiResponse<SiteSettingDto>.Ok(item));
    }

    [HttpPut("bulk")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<IActionResult> UpsertMany([FromBody] List<CreateSiteSettingDto> items)
    {
        var updated = await _service.UpsertManyAsync(items ?? new List<CreateSiteSettingDto>());
        return ApiResults.OkData(this, updated);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<SiteSettingDto>>> Update(Guid id, [FromBody] UpdateSiteSettingDto dto)
    {
        var item = await _service.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<SiteSettingDto>.Fail("Setting not found")) : Ok(ApiResponse<SiteSettingDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Setting not found"));
    }

    private bool IsAdmin() => User.IsInRole("SuperAdmin") || User.IsInRole("Editor");
}
