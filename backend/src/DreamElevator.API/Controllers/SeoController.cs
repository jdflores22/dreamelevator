using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Settings;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class SeoController : ControllerBase
{
    private readonly ISeoSettingService _service;

    public SeoController(ISeoSettingService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var items = await _service.GetAllAsync();
        return ApiResults.OkData(this, items);
    }

    [HttpGet("page/{pageKey}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<SeoSettingDto>>> GetByPageKey(string pageKey)
    {
        var item = await _service.GetByPageKeyAsync(pageKey);
        return item is null ? NotFound(ApiResponse<SeoSettingDto>.Fail("SEO setting not found")) : Ok(ApiResponse<SeoSettingDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<SeoSettingDto>>> Create([FromBody] CreateSeoSettingDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return Ok(ApiResponse<SeoSettingDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<SeoSettingDto>>> Update(Guid id, [FromBody] UpdateSeoSettingDto dto)
    {
        var item = await _service.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<SeoSettingDto>.Fail("SEO setting not found")) : Ok(ApiResponse<SeoSettingDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("SEO setting not found"));
    }
}
