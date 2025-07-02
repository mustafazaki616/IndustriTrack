using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class MakeDaysFieldsPersistent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DaysLeftForCompletePayment",
                table: "Payments");

            migrationBuilder.RenameColumn(
                name: "FullPaymentStartDate",
                table: "Payments",
                newName: "FullPaymentDueDate");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AdvanceDueDate",
                table: "Payments",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "TEXT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FullPaymentDueDate",
                table: "Payments",
                newName: "FullPaymentStartDate");

            migrationBuilder.AlterColumn<DateTime>(
                name: "AdvanceDueDate",
                table: "Payments",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DaysLeftForCompletePayment",
                table: "Payments",
                type: "INTEGER",
                nullable: true);
        }
    }
}
