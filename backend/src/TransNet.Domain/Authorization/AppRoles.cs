namespace TransNet.Domain.Authorization;

public static class AppRoles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Editor = "Editor";
    public const string Staff = "Staff";
    public const string Accounting = "Accounting";
    public const string Admin = "Admin";

    /// <summary>Website CMS roles. Comma-separated for [Authorize(Roles = ...)].</summary>
    public const string Cms = SuperAdmin + "," + Editor;

    /// <summary>Parts inventory — CMS and operational workspace roles.</summary>
    public const string Inventory = Cms + "," + Staff + "," + Accounting + "," + Admin;

    public static readonly string[] WorkspaceRoleNames = { Staff, Accounting, Admin };

    public static bool IsCms(string? role) =>
        string.Equals(role, SuperAdmin, StringComparison.OrdinalIgnoreCase)
        || string.Equals(role, Editor, StringComparison.OrdinalIgnoreCase);
}
