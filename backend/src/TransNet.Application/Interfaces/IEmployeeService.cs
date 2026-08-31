using TransNet.Application.Common;
using TransNet.Application.DTOs.Employees;

namespace TransNet.Application.Interfaces;

public interface IEmployeeService
{
    Task<(List<EmployeeDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        string? department,
        bool activeOnly = false,
        int page = 1,
        int pageSize = 100,
        CancellationToken cancellationToken = default);

    Task<EmployeeDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<EmployeeProfileDto?> GetProfileAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<string>> GetDepartmentsAsync(CancellationToken cancellationToken = default);
    Task<EmployeeDto> CreateAsync(UpsertEmployeeDto dto, CancellationToken cancellationToken = default);
    Task<EmployeeDto?> UpdateAsync(Guid id, UpsertEmployeeDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
