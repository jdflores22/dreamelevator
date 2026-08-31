using TransNet.Application.Common;
using TransNet.Application.DTOs.Clients;

namespace TransNet.Application.Interfaces;

public interface IClientService
{
    Task<(List<ClientDto> Items, ResponseMeta Meta)> GetAllAsync(bool adminView, int page = 1, int pageSize = 50, CancellationToken cancellationToken = default);
    Task<ClientDto?> GetByIdAsync(Guid id, bool adminView, CancellationToken cancellationToken = default);
    Task<ClientDto> CreateAsync(CreateClientDto dto, CancellationToken cancellationToken = default);
    Task<ClientDto?> UpdateAsync(Guid id, UpdateClientDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
