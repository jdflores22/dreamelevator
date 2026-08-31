using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TransNet.Persistence;

#nullable disable

namespace TransNet.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260831210000_AddDamagedQuantityToStockMovement")]
    public partial class AddDamagedQuantityToStockMovement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DamagedQuantity",
                table: "StockMovements",
                type: "decimal(18,3)",
                precision: 18,
                scale: 3,
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "DamagedQuantity", table: "StockMovements");
        }
    }
}
