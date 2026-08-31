using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Careers;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class CareersController : ControllerBase
{
    private readonly ICareerService _careerService;
    private readonly IJobApplicationService _applicationService;

    public CareersController(ICareerService careerService, IJobApplicationService applicationService)
    {
        _careerService = careerService;
        _applicationService = applicationService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, meta) = await _careerService.GetAllAsync(IsAdmin(), page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<CareerDto>>> GetById(Guid id)
    {
        var item = await _careerService.GetByIdAsync(id, IsAdmin());
        return item is null ? NotFound(ApiResponse<CareerDto>.Fail("Career not found")) : Ok(ApiResponse<CareerDto>.Ok(item));
    }

    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<CareerDto>>> GetBySlug(string slug)
    {
        var item = await _careerService.GetBySlugAsync(slug);
        return item is null ? NotFound(ApiResponse<CareerDto>.Fail("Career not found")) : Ok(ApiResponse<CareerDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<CareerDto>>> Create([FromBody] CreateCareerDto dto)
    {
        var item = await _careerService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<CareerDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<CareerDto>>> Update(Guid id, [FromBody] UpdateCareerDto dto)
    {
        var item = await _careerService.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<CareerDto>.Fail("Career not found")) : Ok(ApiResponse<CareerDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _careerService.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Career not found"));
    }

    [HttpGet("applications")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<IActionResult> GetApplications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, meta) = await _applicationService.GetAllAsync(page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpPost("applications")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<JobApplicationDto>>> SubmitApplication([FromBody] CreateJobApplicationDto dto)
    {
        var item = await _applicationService.CreateAsync(dto);
        return Ok(ApiResponse<JobApplicationDto>.Ok(item));
    }

    [HttpPut("applications/{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<JobApplicationDto>>> UpdateApplication(Guid id, [FromBody] UpdateJobApplicationDto dto)
    {
        var item = await _applicationService.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<JobApplicationDto>.Fail("Application not found")) : Ok(ApiResponse<JobApplicationDto>.Ok(item));
    }

    [HttpDelete("applications/{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteApplication(Guid id)
    {
        var deleted = await _applicationService.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Application not found"));
    }

    private bool IsAdmin() => User.IsInRole("SuperAdmin") || User.IsInRole("Editor");
}
