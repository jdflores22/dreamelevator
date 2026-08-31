using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Media;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class UploadController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;

    public UploadController(IFileStorageService fileStorage) => _fileStorage = fileStorage;

    [HttpGet]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<List<MediaFileDto>>>> List([FromQuery] string? folder = null)
    {
        var files = await _fileStorage.ListFilesAsync(folder);
        var dtos = files.Select(f => new MediaFileDto
        {
            Url = f.Url,
            FileName = f.FileName,
            Folder = f.Folder,
            SizeBytes = f.SizeBytes,
            CreatedAt = f.CreatedAt,
        }).ToList();

        return Ok(ApiResponse<List<MediaFileDto>>.Ok(dtos));
    }

    [HttpPost("resume")]
    [AllowAnonymous]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<object>>> UploadResume([FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file provided"));

        try
        {
            await using var stream = file.OpenReadStream();
            var path = await _fileStorage.SaveFileAsync(stream, file.FileName, "resumes");
            return Ok(ApiResponse<object>.Ok(new { url = path, fileName = file.FileName }));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.Fail(ex.Message));
        }
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<object>>> Upload([FromForm] IFormFile file, [FromQuery] string folder = "uploads")
    {
        if (file is null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file provided"));

        await using var stream = file.OpenReadStream();
        var path = await _fileStorage.SaveFileAsync(stream, file.FileName, folder);
        return Ok(ApiResponse<object>.Ok(new { url = path, fileName = file.FileName }));
    }

    [HttpDelete]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete([FromQuery] string path)
    {
        if (string.IsNullOrWhiteSpace(path))
            return BadRequest(ApiResponse<object>.Fail("File path is required"));

        if (!path.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(ApiResponse<object>.Fail("Invalid file path"));

        await _fileStorage.DeleteFileAsync(path);
        return Ok(ApiResponse<object>.Ok(new { deleted = true }));
    }
}
