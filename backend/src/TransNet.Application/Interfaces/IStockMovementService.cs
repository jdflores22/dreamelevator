using TransNet.Application.Common;
using TransNet.Application.DTOs.InventoryParts;

namespace TransNet.Application.Interfaces;

public interface IStockMovementService
{
    Task<(List<StockMovementDto> Items, ResponseMeta Meta)> GetAllAsync(
        string? search,
        string? movementType,
        Guid? inventoryPartId,
        Guid? employeeId,
        DateTime? from,
        DateTime? to,
        int page = 1,
        int pageSize = 50,
        CancellationToken cancellationToken = default);

    Task<StockMovementDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<StockLedgerDto?> GetLedgerAsync(Guid inventoryPartId, CancellationToken cancellationToken = default);

    Task<StockMovementDto> CreateAsync(
        UpsertStockMovementDto dto,
        Guid? recordedByUserId,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
