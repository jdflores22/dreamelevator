using Microsoft.EntityFrameworkCore;
using TransNet.Application.DTOs.Auth;
using TransNet.Application.Interfaces;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(IApplicationDbContext context, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var userDto = MapUser(user);
        var accessToken = _jwtTokenService.GenerateAccessToken(userDto);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        user.RefreshTokenHash = _jwtTokenService.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = userDto
        };
    }

    public async Task<LoginResponse?> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var users = await _context.Users.Include(u => u.Role).ToListAsync(cancellationToken);
        var user = users.FirstOrDefault(u =>
            u.RefreshTokenHash is not null &&
            u.RefreshTokenExpiresAt > DateTime.UtcNow &&
            _jwtTokenService.ValidateRefreshToken(request.RefreshToken, u.RefreshTokenHash));

        if (user is null)
            return null;

        var userDto = MapUser(user);
        var accessToken = _jwtTokenService.GenerateAccessToken(userDto);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        user.RefreshTokenHash = _jwtTokenService.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = userDto
        };
    }

    public async Task LogoutAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
            return;

        user.RefreshTokenHash = null;
        user.RefreshTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static UserDto MapUser(Domain.Entities.User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FirstName = user.FirstName,
        LastName = user.LastName,
        RoleId = user.RoleId,
        RoleName = user.Role.Name,
        IsActive = user.IsActive
    };
}
