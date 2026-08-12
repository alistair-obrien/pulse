using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Pulse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddJourneyStepMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JourneySteps_Metrics_MetricId",
                table: "JourneySteps");

            migrationBuilder.DropIndex(
                name: "IX_JourneySteps_MetricId",
                table: "JourneySteps");

            migrationBuilder.DropIndex(
                name: "IX_JourneySteps_UserId",
                table: "JourneySteps");

            migrationBuilder.DropColumn(
                name: "MetricId",
                table: "JourneySteps");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Date",
                table: "JourneySteps",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.CreateTable(
                name: "JourneyStepMetrics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JourneyStepId = table.Column<int>(type: "integer", nullable: false),
                    MetricTypeId = table.Column<string>(type: "text", nullable: false),
                    JsonValue = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JourneyStepMetrics", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JourneyStepMetrics_JourneySteps_JourneyStepId",
                        column: x => x.JourneyStepId,
                        principalTable: "JourneySteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JourneySteps_UserId_Date",
                table: "JourneySteps",
                columns: new[] { "UserId", "Date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JourneyStepMetrics_JourneyStepId",
                table: "JourneyStepMetrics",
                column: "JourneyStepId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JourneyStepMetrics");

            migrationBuilder.DropIndex(
                name: "IX_JourneySteps_UserId_Date",
                table: "JourneySteps");

            migrationBuilder.DropColumn(
                name: "Date",
                table: "JourneySteps");

            migrationBuilder.AddColumn<int>(
                name: "MetricId",
                table: "JourneySteps",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_JourneySteps_MetricId",
                table: "JourneySteps",
                column: "MetricId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JourneySteps_UserId",
                table: "JourneySteps",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_JourneySteps_Metrics_MetricId",
                table: "JourneySteps",
                column: "MetricId",
                principalTable: "Metrics",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
