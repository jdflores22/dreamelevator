using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Auth;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result is null)
            return Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid email or password"));

        return Ok(ApiResponse<LoginResponse>.Ok(result));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Refresh([FromBody] RefreshRequest request)
    {
        var result = await _authService.RefreshAsync(request);
        if (result is null)
            return Unauthorized(ApiResponse<LoginResponse>.Fail("Invalid or expired refresh token"));

        return Ok(ApiResponse<LoginResponse>.Ok(result));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Logout()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(ApiResponse<object>.Fail("Invalid user"));

        await _authService.LogoutAsync(userId);
        return Ok(ApiResponse<object>.Ok(new { message = "Logged out" }));
    }
}
