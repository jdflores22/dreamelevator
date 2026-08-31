using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Employees;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
[Authorize(Roles = ApiConstants.InventoryRoles)]
public class EmployeesController : ControllerBase
{
    private readonly IEmployeeService _service;

    public EmployeesController(IEmployeeService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? department,
        [FromQuery] bool activeOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var (items, meta) = await _service.GetAllAsync(search, department, activeOnly, page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("departments")]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetDepartments() =>
        Ok(ApiResponse<List<string>>.Ok(await _service.GetDepartmentsAsync()));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null
            ? NotFound(ApiResponse<EmployeeDto>.Fail("Employee not found"))
            : Ok(ApiResponse<EmployeeDto>.Ok(item));
    }

    [HttpGet("{id:guid}/profile")]
    public async Task<ActionResult<ApiResponse<EmployeeProfileDto>>> GetProfile(Guid id)
    {
        var item = await _service.GetProfileAsync(id);
        return item is null
            ? NotFound(ApiResponse<EmployeeProfileDto>.Fail("Employee not found"))
            : Ok(ApiResponse<EmployeeProfileDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> Create([FromBody] UpsertEmployeeDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<EmployeeDto>.Ok(item));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<EmployeeDto>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<EmployeeDto>>> Update(Guid id, [FromBody] UpsertEmployeeDto dto)
    {
        try
        {
            var item = await _service.UpdateAsync(id, dto);
            return item is null
                ? NotFound(ApiResponse<EmployeeDto>.Fail("Employee not found"))
                : Ok(ApiResponse<EmployeeDto>.Ok(item));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<EmployeeDto>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted
            ? Ok(ApiResponse<object>.Ok(new { deleted = true }))
            : NotFound(ApiResponse<object>.Fail("Employee not found"));
    }
}
