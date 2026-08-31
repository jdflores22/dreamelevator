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
public class StockMovementsController : ControllerBase
{
    private readonly IStockMovementService _service;

    public StockMovementsController(IStockMovementService service) => _service = service;

    private Guid? CurrentUserId =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? movementType,
        [FromQuery] Guid? inventoryPartId,
        [FromQuery] Guid? employeeId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var (items, meta) = await _service.GetAllAsync(
            search, movementType, inventoryPartId, employeeId, from, to, page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("ledger/{partId:guid}")]
    public async Task<IActionResult> Ledger(Guid partId)
    {
        var data = await _service.GetLedgerAsync(partId);
        return data is null
            ? NotFound(ApiResponse<object>.Fail("Inventory line not found"))
            : ApiResults.OkData(this, data);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<StockMovementDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null
            ? NotFound(ApiResponse<StockMovementDto>.Fail("Stock movement not found"))
            : Ok(ApiResponse<StockMovementDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<StockMovementDto>>> Create([FromBody] UpsertStockMovementDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto, CurrentUserId);
            return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<StockMovementDto>.Ok(item));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<StockMovementDto>.Fail(ex.Message));
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted
            ? Ok(ApiResponse<object>.Ok(new { deleted = true }))
            : NotFound(ApiResponse<object>.Fail("Stock movement not found"));
    }
}
