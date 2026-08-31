using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Messages;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class MessagesController : ControllerBase
{
    private readonly IContactMessageService _service;

    public MessagesController(IContactMessageService service) => _service = service;

    [HttpGet]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, meta) = await _service.GetAllAsync(page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<ContactMessageDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        return item is null ? NotFound(ApiResponse<ContactMessageDto>.Fail("Message not found")) : Ok(ApiResponse<ContactMessageDto>.Ok(item));
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<ContactMessageDto>>> Create([FromBody] CreateContactMessageDto dto)
    {
        try
        {
            var item = await _service.CreateAsync(dto);
            return Ok(ApiResponse<ContactMessageDto>.Ok(item));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<ContactMessageDto>.Fail(ex.Message));
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<ContactMessageDto>>> Update(Guid id, [FromBody] UpdateContactMessageDto dto)
    {
        var item = await _service.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<ContactMessageDto>.Fail("Message not found")) : Ok(ApiResponse<ContactMessageDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Message not found"));
    }
}
