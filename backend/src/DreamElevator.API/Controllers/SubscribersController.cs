using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Subscribers;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class SubscribersController : ControllerBase
{
    private readonly ISubscriberService _service;

    public SubscribersController(ISubscriberService service) => _service = service;

    [HttpGet]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, meta) = await _service.GetAllAsync(page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<SubscriberDto>>> Subscribe([FromBody] CreateSubscriberDto dto)
    {
        var item = await _service.SubscribeAsync(dto);
        return Ok(ApiResponse<SubscriberDto>.Ok(item));
    }

    [HttpPost("{id:guid}/unsubscribe")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Unsubscribe(Guid id)
    {
        var result = await _service.UnsubscribeAsync(id);
        return result ? Ok(ApiResponse<object>.Ok(new { unsubscribed = true })) : NotFound(ApiResponse<object>.Fail("Subscriber not found"));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Subscriber not found"));
    }
}
