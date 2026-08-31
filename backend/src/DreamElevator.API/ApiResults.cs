using Microsoft.AspNetCore.Mvc;
using TransNet.Application.Common;

namespace DreamElevator.API;

public static class ApiResults
{
    public static IActionResult OkData<T>(ControllerBase controller, T data, ResponseMeta? meta = null) =>
        controller.Ok(new ApiResponse<T> { Data = data, Meta = meta });

    public static IActionResult OkList<T>(ControllerBase controller, List<T> data, ResponseMeta meta)
    {
        var response = new ApiResponse<List<T>> { Data = data, Meta = meta };
        return controller.Ok(response);
    }

    public static IActionResult Fail(ControllerBase controller, string error, int statusCode = 400) =>
        controller.StatusCode(statusCode, ApiResponse<object>.Fail(error));

    public static IActionResult NotFound(ControllerBase controller, string error) =>
        controller.NotFound(ApiResponse<object>.Fail(error));
}
