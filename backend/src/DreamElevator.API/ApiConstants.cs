using TransNet.Domain.Authorization;

namespace DreamElevator.API;

public static class ApiConstants
{
    /// <summary>Website CMS only. Staff, Accounting, and Admin cannot call these APIs.</summary>
    public const string AdminRoles = AppRoles.Cms;
    public const string InventoryRoles = AppRoles.Inventory;
    public const string ApiRoute = "api/v1/[controller]";
}
