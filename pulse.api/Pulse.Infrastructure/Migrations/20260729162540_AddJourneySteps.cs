using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Pulse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddJourneySteps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Metrics_UserId",
                table: "Metrics");

            migrationBuilder.CreateTable(
                name: "JourneySteps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    MetricId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JourneySteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JourneySteps_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JourneySteps_Metrics_MetricId",
                        column: x => x.MetricId,
                        principalTable: "Metrics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Metrics_UserId_Date_MetricTypeId",
                table: "Metrics",
                columns: new[] { "UserId", "Date", "MetricTypeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JourneySteps_MetricId",
                table: "JourneySteps",
                column: "MetricId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JourneySteps_UserId",
                table: "JourneySteps",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JourneySteps");

            migrationBuilder.DropIndex(
                name: "IX_Metrics_UserId_Date_MetricTypeId",
                table: "Metrics");

            migrationBuilder.CreateIndex(
                name: "IX_Metrics_UserId",
                table: "Metrics",
                column: "UserId");
        }
    }
}
