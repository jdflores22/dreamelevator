using TransNet.Application.Common;
using TransNet.Application.DTOs.Settings;

namespace TransNet.Application.Interfaces;

public interface ISiteSettingService
{
    Task<List<SiteSettingDto>> GetAllAsync(bool adminView, CancellationToken cancellationToken = default);
    Task<SiteSettingDto?> GetByKeyAsync(string key, bool adminView, CancellationToken cancellationToken = default);
    Task<SiteSettingDto> CreateAsync(CreateSiteSettingDto dto, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SiteSettingDto>> UpsertManyAsync(IReadOnlyList<CreateSiteSettingDto> items, CancellationToken cancellationToken = default);
    Task<SiteSettingDto?> UpdateAsync(Guid id, UpdateSiteSettingDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface ISeoSettingService
{
    Task<List<SeoSettingDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<SeoSettingDto?> GetByPageKeyAsync(string pageKey, CancellationToken cancellationToken = default);
    Task<SeoSettingDto> CreateAsync(CreateSeoSettingDto dto, CancellationToken cancellationToken = default);
    Task<SeoSettingDto?> UpdateAsync(Guid id, UpdateSeoSettingDto dto, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
