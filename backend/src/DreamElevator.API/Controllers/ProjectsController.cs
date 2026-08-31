using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Projects;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _service;

    public ProjectsController(IProjectService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, meta) = await _service.GetAllAsync(IsAdmin(), page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id, IsAdmin());
        return item is null ? NotFound(ApiResponse<ProjectDto>.Fail("Project not found")) : Ok(ApiResponse<ProjectDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> Create([FromBody] CreateProjectDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<ProjectDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<ProjectDto>>> Update(Guid id, [FromBody] UpdateProjectDto dto)
    {
        var item = await _service.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<ProjectDto>.Fail("Project not found")) : Ok(ApiResponse<ProjectDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Project not found"));
    }

    private bool IsAdmin() => User.IsInRole("SuperAdmin") || User.IsInRole("Editor");
}
