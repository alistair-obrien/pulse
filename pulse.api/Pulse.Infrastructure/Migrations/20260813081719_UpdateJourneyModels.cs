using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pulse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJourneyModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_JourneyLikes_JourneyUserId_JourneyDate_LikedByUserId",
                table: "JourneyLikes");

            migrationBuilder.DropColumn(
                name: "JourneyDate",
                table: "JourneyLikes");

            migrationBuilder.DropColumn(
                name: "JourneyUserId",
                table: "JourneyLikes");

            migrationBuilder.DropColumn(
                name: "JourneyDate",
                table: "JourneyComments");

            migrationBuilder.DropColumn(
                name: "JourneyUserId",
                table: "JourneyComments");

            migrationBuilder.AddColumn<int>(
                name: "JourneyStepId",
                table: "JourneyLikes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "JourneyStepId",
                table: "JourneyComments",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_JourneyLikes_JourneyStepId_LikedByUserId",
                table: "JourneyLikes",
                columns: new[] { "JourneyStepId", "LikedByUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JourneyComments_JourneyStepId",
                table: "JourneyComments",
                column: "JourneyStepId");

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyComments_JourneySteps_JourneyStepId",
                table: "JourneyComments",
                column: "JourneyStepId",
                principalTable: "JourneySteps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_JourneyLikes_JourneySteps_JourneyStepId",
                table: "JourneyLikes",
                column: "JourneyStepId",
                principalTable: "JourneySteps",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JourneyComments_JourneySteps_JourneyStepId",
                table: "JourneyComments");

            migrationBuilder.DropForeignKey(
                name: "FK_JourneyLikes_JourneySteps_JourneyStepId",
                table: "JourneyLikes");

            migrationBuilder.DropIndex(
                name: "IX_JourneyLikes_JourneyStepId_LikedByUserId",
                table: "JourneyLikes");

            migrationBuilder.DropIndex(
                name: "IX_JourneyComments_JourneyStepId",
                table: "JourneyComments");

            migrationBuilder.DropColumn(
                name: "JourneyStepId",
                table: "JourneyLikes");

            migrationBuilder.DropColumn(
                name: "JourneyStepId",
                table: "JourneyComments");

            migrationBuilder.AddColumn<DateOnly>(
                name: "JourneyDate",
                table: "JourneyLikes",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<string>(
                name: "JourneyUserId",
                table: "JourneyLikes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateOnly>(
                name: "JourneyDate",
                table: "JourneyComments",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<string>(
                name: "JourneyUserId",
                table: "JourneyComments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_JourneyLikes_JourneyUserId_JourneyDate_LikedByUserId",
                table: "JourneyLikes",
                columns: new[] { "JourneyUserId", "JourneyDate", "LikedByUserId" },
                unique: true);
        }
    }
}
