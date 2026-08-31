using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TransNet.Persistence;

#nullable disable

namespace TransNet.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260831200000_AddStockMovements")]
    public partial class AddStockMovements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StockMovements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    InventoryPartId = table.Column<Guid>(type: "char(36)", nullable: false),
                    MovementType = table.Column<string>(type: "varchar(32)", maxLength: 32, nullable: false),
                    Quantity = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    Delta = table.Column<decimal>(type: "decimal(18,3)", precision: 18, scale: 3, nullable: false),
                    OccurredAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    SourceIssuanceId = table.Column<Guid>(type: "char(36)", nullable: true),
                    EmployeeId = table.Column<Guid>(type: "char(36)", nullable: true),
                    EmployeeName = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Reason = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: false),
                    RecordedByUserId = table.Column<Guid>(type: "char(36)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsPublished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StockMovements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StockMovements_InventoryParts_InventoryPartId",
                        column: x => x.InventoryPartId,
                        principalTable: "InventoryParts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StockMovements_InventoryIssuances_SourceIssuanceId",
                        column: x => x.SourceIssuanceId,
                        principalTable: "InventoryIssuances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_StockMovements_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_InventoryPartId",
                table: "StockMovements",
                column: "InventoryPartId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_OccurredAt",
                table: "StockMovements",
                column: "OccurredAt");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_SourceIssuanceId",
                table: "StockMovements",
                column: "SourceIssuanceId");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_EmployeeId",
                table: "StockMovements",
                column: "EmployeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "StockMovements");
        }
    }
}
