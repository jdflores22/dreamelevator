using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Auth;
using TransNet.Application.DTOs.Users;
using TransNet.Application.Interfaces;
using TransNet.Domain.Authorization;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
[Authorize(Roles = AppRoles.SuperAdmin)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRoleService _roleService;

    public UsersController(IUserService userService, IRoleService roleService)
    {
        _userService = userService;
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, meta) = await _userService.GetAllAsync(page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetById(Guid id)
    {
        var item = await _userService.GetByIdAsync(id);
        return item is null ? NotFound(ApiResponse<UserDto>.Fail("User not found")) : Ok(ApiResponse<UserDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> Create([FromBody] CreateUserDto dto)
    {
        var item = await _userService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<UserDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        var item = await _userService.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<UserDto>.Fail("User not found")) : Ok(ApiResponse<UserDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _userService.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("User not found"));
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _roleService.GetAllAsync();
        return ApiResults.OkData(this, roles);
    }

    [HttpPost("roles")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> CreateRole([FromBody] CreateRoleDto dto)
    {
        var role = await _roleService.CreateAsync(dto);
        return Ok(ApiResponse<RoleDto>.Ok(role));
    }

    [HttpPut("roles/{id:guid}")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> UpdateRole(Guid id, [FromBody] UpdateRoleDto dto)
    {
        var role = await _roleService.UpdateAsync(id, dto);
        return role is null ? NotFound(ApiResponse<RoleDto>.Fail("Role not found")) : Ok(ApiResponse<RoleDto>.Ok(role));
    }

    [HttpDelete("roles/{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteRole(Guid id)
    {
        var deleted = await _roleService.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : BadRequest(ApiResponse<object>.Fail("Role not found or has assigned users"));
    }
}
