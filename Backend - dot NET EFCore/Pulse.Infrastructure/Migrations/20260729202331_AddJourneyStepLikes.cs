using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Pulse.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddJourneyStepLikes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JourneyComments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JourneyUserId = table.Column<string>(type: "text", nullable: false),
                    JourneyDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CommentedByUserId = table.Column<string>(type: "text", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    CreatedUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JourneyComments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JourneyLikes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JourneyUserId = table.Column<string>(type: "text", nullable: false),
                    JourneyDate = table.Column<DateOnly>(type: "date", nullable: false),
                    LikedByUserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JourneyLikes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JourneyLikes_JourneyUserId_JourneyDate_LikedByUserId",
                table: "JourneyLikes",
                columns: new[] { "JourneyUserId", "JourneyDate", "LikedByUserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JourneyComments");

            migrationBuilder.DropTable(
                name: "JourneyLikes");
        }
    }
}
