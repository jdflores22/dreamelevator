using TransNet.Application.Common;
using TransNet.Application.DTOs.InventoryParts;

namespace TransNet.Application.Interfaces;

public interface IInventoryIssuanceService
{
    Task<(List<InventoryIssuanceDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        Guid? clientId,
        Guid? inventoryPartId,
        Guid? employeeId,
        DateTime? from,
        DateTime? to,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default);

    Task<InventoryIssuanceDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<InventoryIssuanceDto> CreateAsync(
        UpsertInventoryIssuanceDto dto,
        Guid? issuedByUserId,
        CancellationToken cancellationToken = default);

    Task<InventoryIssuanceDto?> UpdateAsync(
        Guid id,
        UpsertInventoryIssuanceDto dto,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    Task<InventoryAvailabilityDto?> GetAvailabilityAsync(Guid inventoryPartId, CancellationToken cancellationToken = default);

    Task<InventoryIssuanceOptionsDto> GetOptionsAsync(CancellationToken cancellationToken = default);
}
