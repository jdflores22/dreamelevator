using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;
using TransNet.Application.DTOs.Products;
using TransNet.Application.Interfaces;

namespace DreamElevator.API.Controllers;

[ApiController]
[Route(ApiConstants.ApiRoute)]
public class ProductsController : ControllerBase
{
    private readonly IProductService _service;

    public ProductsController(IProductService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var (items, meta) = await _service.GetAllAsync(IsAdmin(), page, pageSize);
        return ApiResults.OkList(this, items, meta);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id, IsAdmin());
        return item is null ? NotFound(ApiResponse<ProductDto>.Fail("Product not found")) : Ok(ApiResponse<ProductDto>.Ok(item));
    }

    [HttpGet("slug/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetBySlug(string slug)
    {
        var item = await _service.GetBySlugAsync(slug);
        return item is null ? NotFound(ApiResponse<ProductDto>.Fail("Product not found")) : Ok(ApiResponse<ProductDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create([FromBody] CreateProductDto dto)
    {
        var item = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<ProductDto>.Ok(item));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Update(Guid id, [FromBody] UpdateProductDto dto)
    {
        var item = await _service.UpdateAsync(id, dto);
        return item is null ? NotFound(ApiResponse<ProductDto>.Fail("Product not found")) : Ok(ApiResponse<ProductDto>.Ok(item));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = ApiConstants.AdminRoles)]
    public async Task<ActionResult<ApiResponse<object>>> Delete(Guid id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? Ok(ApiResponse<object>.Ok(new { deleted = true })) : NotFound(ApiResponse<object>.Fail("Product not found"));
    }

    private bool IsAdmin() => User.IsInRole("SuperAdmin") || User.IsInRole("Editor");
}
