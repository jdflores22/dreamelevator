using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TransNet.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddClientLocation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Clients",
                type: "longtext",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Clients");
        }
    }
}
