using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.ProcessSteps;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class ProcessStepsController : ControllerBase
{
    private readonly IProcessStepService _service;

    public ProcessStepsController(IProcessStepService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var (items, meta) = await _service.GetAllAsync(IsAdmin(), page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<ProcessStepDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id, IsAdmin());
        return item is null ? NotFound(ApiResponse<ProcessStepDto>.Fail("Process step not found")) : Ok(ApiResponse<ProcessStepDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<ProcessStepDto>>> Create([FromBody] CreateProcessStepDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<ProcessStepDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<ProcessStepDto>>> Update(Guid id, [FromBody] UpdateProcessStepDto dto)
    {
        var item = await _service.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<ProcessStepDto>.Fail("Process step not found")) : Ok(ApiResponse<ProcessStepDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Process step not found"));
    }

    private bool IsAdmin() => User.IsInRole("SuperAdmin") || User.IsInRole("Editor");
}
