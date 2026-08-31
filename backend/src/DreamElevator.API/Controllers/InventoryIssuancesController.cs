using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.InventoryParts;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
[Authorize(Roles = ApiConstants.InventoryRoles)]
public class InventoryIssuancesController : ControllerBase
{
    private readonly IInventoryIssuanceService _service;

    public InventoryIssuancesController(IInventoryIssuanceService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] Guid? clientId,
        [FromQuery] Guid? inventoryPartId,
        [FromQuery] Guid? employeeId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var (items, meta) = await _service.GetAllAsync(search, clientId, inventoryPartId, employeeId, from, to, page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("options")]
    public async Task<IActionResult> Options()
    {
        var data = await _service.GetOptionsAsync();
        return ApiResults.OkData(this, data);
    }

    [HttpGet("available/{partId:guid}")]
    public async Task<IActionResult> Available(Guid partId)
    {
        var data = await _service.GetAvailabilityAsync(partId);
        return data is null
            ? NotFound(ApiResponse<object>.Fail("Inventory line not found"))
            : ApiResults.OkData(this, data);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<InventoryIssuanceDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null
            ? NotFound(ApiResponse<InventoryIssuanceDto>.Fail("Issuance not found"))
            : Ok(ApiResponse<InventoryIssuanceDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<InventoryIssuanceDto>>> Create([FromBody] UpsertInventoryIssuanceDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<InventoryIssuanceDto>.Ok(item));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<InventoryIssuanceDto>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<InventoryIssuanceDto>>> Update(Guid id, [FromBody] UpsertInventoryIssuanceDto dto)
    {
        try
        {
            var item = await _service.UpdateAsync(id, dto);
            return item is null
                ? NotFound(ApiResponse<InventoryIssuanceDto>.Fail("Issuance not found"))
                : Ok(ApiResponse<InventoryIssuanceDto>.Ok(item));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<InventoryIssuanceDto>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted
            ? Ok(ApiResponse<object>.Ok(new { deleted = true }))
            : NotFound(ApiResponse<object>.Fail("Issuance not found"));
    }

    private Guid? GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name);
        return Guid.TryParse(id, out var userId) ? userId : null;
    }
}
