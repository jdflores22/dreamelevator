using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.InventoryParts;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
[Authorize(Roles = ApiConstants.InventoryRoles)]
public class InventoryPartsController : ControllerBase
{
    private readonly IInventoryPartService _service;

    public InventoryPartsController(IInventoryPartService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? supplier,
        [FromQuery] string? project,
        [FromQuery] string? lineKind,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var (items, meta) = await _service.GetAllAsync(search, supplier, project, lineKind, from, to, page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var data = await _service.GetDashboardAsync();
        return ApiResults.OkData(this, data);
    }

    [HttpGet("filters")]
    public async Task<IActionResult> Filters()
    {
        var data = await _service.GetFiltersAsync();
        return ApiResults.OkData(this, data);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<InventoryPartDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null
            ? NotFound(ApiResponse<InventoryPartDto>.Fail("Inventory line not found"))
            : Ok(ApiResponse<InventoryPartDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<InventoryPartDto>>> Create([FromBody] UpsertInventoryPartDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Item))
            return BadRequest(ApiResponse<InventoryPartDto>.Fail("Item is required"));

        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<InventoryPartDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<InventoryPartDto>>> Update(Guid id, [FromBody] UpsertInventoryPartDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Item))
            return BadRequest(ApiResponse<InventoryPartDto>.Fail("Item is required"));

        var item = await _service.UpdateAsync(id, dto);
        return item is null
            ? NotFound(ApiResponse<InventoryPartDto>.Fail("Inventory line not found"))
            : Ok(ApiResponse<InventoryPartDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted
            ? Ok(ApiResponse<object>.Ok(new { deleted = true }))
            : NotFound(ApiResponse<object>.Fail("Inventory line not found"));
    }
}
