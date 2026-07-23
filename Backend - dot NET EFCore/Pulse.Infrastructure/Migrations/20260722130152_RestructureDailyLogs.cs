using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RestructureDailyLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "SleepHours",
                table: "DailyLogs",
                newName: "Weight");

            migrationBuilder.RenameColumn(
                name: "Protein",
                table: "DailyLogs",
                newName: "Steps");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "DailyLogs",
                newName: "Reflection");

            migrationBuilder.RenameColumn(
                name: "Calories",
                table: "DailyLogs",
                newName: "RestingHeartRate");

            migrationBuilder.AddColumn<double>(
                name: "BodyFatPercentage",
                table: "DailyLogs",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<bool>(
                name: "SharePublicly",
                table: "DailyLogs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "Nutrition",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DailyLogId = table.Column<int>(type: "int", nullable: false),
                    Calories = table.Column<int>(type: "int", nullable: false),
                    Protein = table.Column<int>(type: "int", nullable: false),
                    Carbs = table.Column<int>(type: "int", nullable: false),
                    Fat = table.Column<int>(type: "int", nullable: false),
                    NutritionNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nutrition", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Nutrition_DailyLogs_DailyLogId",
                        column: x => x.DailyLogId,
                        principalTable: "DailyLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SleepLog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DailyLogId = table.Column<int>(type: "int", nullable: false),
                    SleepHours = table.Column<double>(type: "float", nullable: false),
                    SleepNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SleepLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SleepLog_DailyLogs_DailyLogId",
                        column: x => x.DailyLogId,
                        principalTable: "DailyLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutLog",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DailyLogId = table.Column<int>(type: "int", nullable: false),
                    WorkoutName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WorkoutDuration = table.Column<TimeSpan>(type: "time", nullable: false),
                    WorkoutVolume = table.Column<int>(type: "int", nullable: false),
                    PersonalRecords = table.Column<int>(type: "int", nullable: false),
                    WorkoutNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutLog_DailyLogs_DailyLogId",
                        column: x => x.DailyLogId,
                        principalTable: "DailyLogs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Nutrition_DailyLogId",
                table: "Nutrition",
                column: "DailyLogId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SleepLog_DailyLogId",
                table: "SleepLog",
                column: "DailyLogId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutLog_DailyLogId",
                table: "WorkoutLog",
                column: "DailyLogId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Nutrition");

            migrationBuilder.DropTable(
                name: "SleepLog");

            migrationBuilder.DropTable(
                name: "WorkoutLog");

            migrationBuilder.DropColumn(
                name: "BodyFatPercentage",
                table: "DailyLogs");

            migrationBuilder.DropColumn(
                name: "SharePublicly",
                table: "DailyLogs");

            migrationBuilder.RenameColumn(
                name: "Weight",
                table: "DailyLogs",
                newName: "SleepHours");

            migrationBuilder.RenameColumn(
                name: "Steps",
                table: "DailyLogs",
                newName: "Protein");

            migrationBuilder.RenameColumn(
                name: "RestingHeartRate",
                table: "DailyLogs",
                newName: "Calories");

            migrationBuilder.RenameColumn(
                name: "Reflection",
                table: "DailyLogs",
                newName: "Notes");
        }
    }
}
