using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TransNet.Persistence;

#nullable disable

namespace TransNet.Persistence.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260831180000_AddSuppliers")]
    public partial class AddSuppliers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Suppliers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false),
                    Name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    ContactPerson = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    Phone = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false),
                    Country = table.Column<string>(type: "varchar(128)", maxLength: 128, nullable: false),
                    Address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false),
                    Notes = table.Column<string>(type: "longtext", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    IsPublished = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Suppliers", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Suppliers_Name",
                table: "Suppliers",
                column: "Name");

            // Backfill the master list from names already used in the purchase register.
            migrationBuilder.Sql(@"
                INSERT INTO Suppliers
                    (Id, Name, ContactPerson, Email, Phone, Country, Address, Notes,
                     SortOrder, CreatedAt, UpdatedAt, IsPublished, IsDeleted)
                SELECT
                    UUID(), src.Name, '', '', '', '', '', '',
                    0, UTC_TIMESTAMP(), UTC_TIMESTAMP(), 1, 0
                FROM (
                    SELECT DISTINCT TRIM(Supplier) AS Name
                    FROM InventoryParts
                    WHERE IsDeleted = 0 AND TRIM(Supplier) <> ''
                ) AS src;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Suppliers");
        }
    }
}
