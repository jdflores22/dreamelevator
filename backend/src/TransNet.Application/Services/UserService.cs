using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Auth;
using TransNet.Application.DTOs.Users;
using TransNet.Application.Interfaces;
using TransNet.Domain.Entities;
using TransNet.Domain.Interfaces;

namespace TransNet.Application.Services;

public class UserService : IUserService
{
    private readonly IApplicationDbContext _context;

    public UserService(IApplicationDbContext context) => _context = context;

    public async Task<(List<UserDto> Items, ResponseMeta Meta)> GetAllAsync(int page = 1, int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var query = _context.Users.Include(u => u.Role).OrderBy(u => u.Email);
        var (items, meta) = await QueryExtensions.ToPagedListAsync(query, page, pageSize, cancellationToken);
        return (items.Select(Map).ToList(), meta);
    }

    public async Task<UserDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            RoleId = dto.RoleId,
            IsActive = dto.IsActive
        };
        _context.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var role = await _context.Roles.FirstAsync(r => r.Id == dto.RoleId, cancellationToken);
        entity.Role = role;
        return Map(entity);
    }

    public async Task<UserDto?> UpdateAsync(Guid id, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (entity is null) return null;

        entity.Email = dto.Email;
        if (!string.IsNullOrWhiteSpace(dto.Password))
            entity.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        entity.FirstName = dto.FirstName;
        entity.LastName = dto.LastName;
        entity.RoleId = dto.RoleId;
        entity.IsActive = dto.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        var role = await _context.Roles.FirstAsync(r => r.Id == dto.RoleId, cancellationToken);
        entity.Role = role;
        return Map(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (entity is null) return false;

        entity.IsActive = false;
        entity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static UserDto Map(User entity) => new()
    {
        Id = entity.Id,
        Email = entity.Email,
        FirstName = entity.FirstName,
        LastName = entity.LastName,
        RoleId = entity.RoleId,
        RoleName = entity.Role.Name,
        IsActive = entity.IsActive
    };
}

public class RoleService : IRoleService
{
    private readonly IApplicationDbContext _context;

    public RoleService(IApplicationDbContext context) => _context = context;

    public async Task<List<RoleDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _context.Roles
            .Include(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .OrderBy(r => r.Name)
            .ToListAsync(cancellationToken);

        return roles.Select(Map).ToList();
    }

    public async Task<RoleDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Roles
            .Include(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        return entity is null ? null : Map(entity);
    }

    public async Task<RoleDto> CreateAsync(CreateRoleDto dto, CancellationToken cancellationToken = default)
    {
        var entity = new Role { Name = dto.Name, Description = dto.Description };
        _context.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        await SyncPermissions(entity, dto.PermissionNames, cancellationToken);
        return await GetByIdAsync(entity.Id, cancellationToken) ?? Map(entity);
    }

    public async Task<RoleDto?> UpdateAsync(Guid id, UpdateRoleDto dto, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (entity is null) return null;

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        await _context.SaveChangesAsync(cancellationToken);
        await SyncPermissions(entity, dto.PermissionNames, cancellationToken);
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Roles.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (entity is null) return false;

        var hasUsers = await _context.Users.AnyAsync(u => u.RoleId == id, cancellationToken);
        if (hasUsers) return false;

        _context.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    private async Task SyncPermissions(Role role, List<string> permissionNames, CancellationToken cancellationToken)
    {
        var permissions = await _context.Permissions
            .Where(p => permissionNames.Contains(p.Name))
            .ToListAsync(cancellationToken);

        var existing = await _context.RolePermissions
            .Where(rp => rp.RoleId == role.Id)
            .ToListAsync(cancellationToken);

        foreach (var rp in existing)
            _context.Remove(rp);

        foreach (var permission in permissions)
        {
            _context.Add(new RolePermission { RoleId = role.Id, PermissionId = permission.Id });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private static RoleDto Map(Role entity) => new()
    {
        Id = entity.Id,
        Name = entity.Name,
        Description = entity.Description,
        Permissions = entity.RolePermissions?.Select(rp => rp.Permission.Name).ToList() ?? new List<string>()
    };
}
