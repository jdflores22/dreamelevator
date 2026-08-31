using TransNet.Application.Common;
using TransNet.Application.DTOs.InventoryParts;

namespace TransNet.Application.Interfaces;

public interface IInventoryPartService
{
    Task<(List<InventoryPartDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        string? supplier,
        string? project,
        string? lineKind,
        DateTime? from,
        DateTime? to,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default);

    Task<InventoryPartDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InventoryPartDto> CreateAsync(UpsertInventoryPartDto dto, CancellationToken cancellationToken = default);
    Task<InventoryPartDto?> UpdateAsync(Guid id, UpsertInventoryPartDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<InventoryDashboardDto> GetDashboardAsync(CancellationToken cancellationToken = default);
    Task<InventoryFiltersDto> GetFiltersAsync(CancellationToken cancellationToken = default);
}
