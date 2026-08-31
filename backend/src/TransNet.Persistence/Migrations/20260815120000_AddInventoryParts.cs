using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TransNet.Persistence;

#nullable disable

namespace TransNet.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260815120000_AddInventoryParts")]
    public partial class AddInventoryParts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InventoryParts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    PurchasedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Supplier = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Item = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Specification = table.Column<string>(type: "longtext", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,4)", precision: 18, scale: 4, nullable: true),
                    AmountInPeso = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ProjectBuilding = table.Column<string>(type: "longtext", nullable: false),
                    LineKind = table.Column<string>(type: "varchar(32)", maxLength: 32, nullable: false),
                    Currency = table.Column<string>(type: "varchar(8)", maxLength: 8, nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsPublished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryParts", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryParts_Item",
                table: "InventoryParts",
                column: "Item");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryParts_PurchasedAt",
                table: "InventoryParts",
                column: "PurchasedAt");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryParts_Supplier",
                table: "InventoryParts",
                column: "Supplier");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "InventoryParts");
        }
    }
}
