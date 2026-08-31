using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Blogs;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class BlogsController : ControllerBase
{
    private readonly IBlogService _blogService;
    private readonly IBlogCategoryService _categoryService;

    public BlogsController(IBlogService blogService, IBlogCategoryService categoryService)
    {
        _blogService = blogService;
        _categoryService = categoryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var (items, meta) = await _blogService.GetAllAsync(IsAdmin(), page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<BlogDto>>> GetById(Guid id)
    {
        var item = await _blogService.GetByIdAsync(id, IsAdmin());
        return item is null ? NotFound(ApiResponse<BlogDto>.Fail("Blog not found")) : Ok(ApiResponse<BlogDto>.Ok(item));
    }

    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<BlogDto>>> GetBySlug(string slug)
    {
        var item = await _blogService.GetBySlugAsync(slug);
        return item is null ? NotFound(ApiResponse<BlogDto>.Fail("Blog not found")) : Ok(ApiResponse<BlogDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<BlogDto>>> Create([FromBody] CreateBlogDto dto)
    {
        var authorId = GetUserId();
        var item = await _blogService.CreateAsync(dto, authorId);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<BlogDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<BlogDto>>> Update(Guid id, [FromBody] UpdateBlogDto dto)
    {
        var item = await _blogService.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<BlogDto>.Fail("Blog not found")) : Ok(ApiResponse<BlogDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _blogService.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Blog not found"));
    }

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var (items, meta) = await _categoryService.GetAllAsync(IsAdmin(), page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpPost("categories")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<BlogCategoryDto>>> CreateCategory([FromBody] CreateBlogCategoryDto dto)
    {
        var item = await _categoryService.CreateAsync(dto);
        return Ok(ApiResponse<BlogCategoryDto>.Ok(item));
    }

    [HttpPut("categories/{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<BlogCategoryDto>>> UpdateCategory(Guid id, [FromBody] UpdateBlogCategoryDto dto)
    {
        var item = await _categoryService.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<BlogCategoryDto>.Fail("Category not found")) : Ok(ApiResponse<BlogCategoryDto>.Ok(item));
    }

    [HttpDelete("categories/{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteCategory(Guid id)
    {
        var deleted = await _categoryService.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Category not found"));
    }

    private bool IsAdmin() => User.IsInRole("SuperAdmin") || User.IsInRole("Editor");

    private Guid? GetUserId()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue(ClaimTypes.Name);
        return Guid.TryParse(id, out var userId) ? userId : null;
    }
}
