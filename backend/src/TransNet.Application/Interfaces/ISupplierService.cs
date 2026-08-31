using TransNet.Application.Common;
using TransNet.Application.DTOs.Suppliers;

namespace TransNet.Application.Interfaces;

public interface ISupplierService
{
    Task<(List<SupplierDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        bool activeOnly = false,
        int page = 1,
        int pageSize = 100,
        CancellationToken cancellationToken = default);

    Task<SupplierDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<SupplierDto> CreateAsync(UpsertSupplierDto dto, CancellationToken cancellationToken = default);
    Task<SupplierDto?> UpdateAsync(Guid id, UpsertSupplierDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
