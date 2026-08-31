using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TransNet.Persistence;

#nullable disable

namespace TransNet.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260831190000_AddEmployees")]
    public partial class AddEmployees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    EmployeeCode = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false),
                    FirstName = table.Column<string>(type: "varchar(128)", maxLength: 128, nullable: false),
                    LastName = table.Column<string>(type: "varchar(128)", maxLength: 128, nullable: false),
                    Position = table.Column<string>(type: "varchar(128)", maxLength: 128, nullable: false),
                    Department = table.Column<string>(type: "varchar(128)", maxLength: 128, nullable: false),
                    Email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false),
                    PhotoUrl = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false),
                    HiredAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Notes = table.Column<string>(type: "longtext", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsPublished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_EmployeeCode",
                table: "Employees",
                column: "EmployeeCode");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_LastName",
                table: "Employees",
                column: "LastName");

            migrationBuilder.AddColumn<Guid>(
                name: "ReceivedByEmployeeId",
                table: "InventoryIssuances",
                type: "char(36)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReceivedByPosition",
                table: "InventoryIssuances",
                type: "varchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryIssuances_ReceivedByEmployeeId",
                table: "InventoryIssuances",
                column: "ReceivedByEmployeeId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryIssuances_Employees_ReceivedByEmployeeId",
                table: "InventoryIssuances",
                column: "ReceivedByEmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            // Give past recipients a profile so their history is not orphaned.
            migrationBuilder.Sql(@"
                INSERT INTO Employees
                    (Id, EmployeeCode, FirstName, LastName, Position, Department, Email, Phone,
                     PhotoUrl, HiredAt, Notes, SortOrder, UserId, CreatedAt, UpdatedAt, IsPublished, IsDeleted)
                SELECT
                    UUID(), '',
                    SUBSTRING_INDEX(src.Name, ' ', 1),
                    TRIM(SUBSTRING(src.Name, LENGTH(SUBSTRING_INDEX(src.Name, ' ', 1)) + 1)),
                    '', '', '', '', '', NULL, '', 0, NULL,
                    UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1, 0
                FROM (
                    SELECT DISTINCT TRIM(ReceivedByName) AS Name
                    FROM InventoryIssuances
                    WHERE IsDeleted = 0 AND TRIM(ReceivedByName) <> ''
                ) AS src;
            ");

            migrationBuilder.Sql(@"
                UPDATE InventoryIssuances i
                JOIN Employees e
                    ON e.IsDeleted = 0
                    AND TRIM(CONCAT(e.FirstName, ' ', e.LastName)) = TRIM(i.ReceivedByName)
                SET i.ReceivedByEmployeeId = e.Id
                WHERE i.IsDeleted = 0 AND i.ReceivedByEmployeeId IS NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryIssuances_Employees_ReceivedByEmployeeId",
                table: "InventoryIssuances");

            migrationBuilder.DropIndex(
                name: "IX_InventoryIssuances_ReceivedByEmployeeId",
                table: "InventoryIssuances");

            migrationBuilder.DropColumn(name: "ReceivedByEmployeeId", table: "InventoryIssuances");
            migrationBuilder.DropColumn(name: "ReceivedByPosition", table: "InventoryIssuances");
            migrationBuilder.DropTable(name: "Employees");
        }
    }
}
