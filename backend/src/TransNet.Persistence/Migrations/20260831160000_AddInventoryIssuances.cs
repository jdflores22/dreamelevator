using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TransNet.Persistence;

#nullable disable

namespace TransNet.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260831160000_AddInventoryIssuances")]
    public partial class AddInventoryIssuances : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InventoryIssuances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    InventoryPartId = table.Column<Guid>(type: "char(36)", nullable: true),
                    Item = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Specification = table.Column<string>(type: "longtext", nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ReceivedByUserId = table.Column<Guid>(type: "char(36)", nullable: true),
                    ReceivedByName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    ClientId = table.Column<Guid>(type: "char(36)", nullable: true),
                    ClientName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    ProjectBuilding = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Purpose = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: false),
                    IssuedByUserId = table.Column<Guid>(type: "char(36)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsPublished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InventoryIssuances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InventoryIssuances_InventoryParts_InventoryPartId",
                        column: x => x.InventoryPartId,
                        principalTable: "InventoryParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryIssuances_ClientId",
                table: "InventoryIssuances",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryIssuances_InventoryPartId",
                table: "InventoryIssuances",
                column: "InventoryPartId");

            migrationBuilder.CreateIndex(
                name: "IX_InventoryIssuances_IssuedAt",
                table: "InventoryIssuances",
                column: "IssuedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "InventoryIssuances");
        }
    }
}
