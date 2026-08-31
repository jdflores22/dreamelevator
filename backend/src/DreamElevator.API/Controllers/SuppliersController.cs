using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Suppliers;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
[Authorize(Roles = ApiConstants.InventoryRoles)]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _service;

    public SuppliersController(ISupplierService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool activeOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100)
    {
        var (items, meta) = await _service.GetAllAsync(search, activeOnly, page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null
            ? NotFound(ApiResponse<SupplierDto>.Fail("Supplier not found"))
            : Ok(ApiResponse<SupplierDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> Create([FromBody] UpsertSupplierDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<SupplierDto>.Ok(item));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<SupplierDto>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<SupplierDto>>> Update(Guid id, [FromBody] UpsertSupplierDto dto)
    {
        try
        {
            var item = await _service.UpdateAsync(id, dto);
            return item is null
                ? NotFound(ApiResponse<SupplierDto>.Fail("Supplier not found"))
                : Ok(ApiResponse<SupplierDto>.Ok(item));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<SupplierDto>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted
            ? Ok(ApiResponse<object>.Ok(new { deleted = true }))
            : NotFound(ApiResponse<object>.Fail("Supplier not found"));
    }
}
