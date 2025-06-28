using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using backend.Models;
using System.Text.Json;

namespace backend.Data
{
    public class IndustriTrackContext : DbContext
    {
        public IndustriTrackContext(DbContextOptions<IndustriTrackContext> options)
            : base(options)
        {
        }

        public DbSet<OrderModel> Orders { get; set; }
        public DbSet<CustomerModel> Customers { get; set; }
        public DbSet<ShipmentModel> Shipments { get; set; }
        public DbSet<ProductionModel> Productions { get; set; }
        public DbSet<InspectionModel> Inspections { get; set; }
        public DbSet<PaymentModel> Payments { get; set; }
        public DbSet<InventoryModel> Inventory { get; set; }
        public DbSet<ReportModel> Reports { get; set; }
        public DbSet<SettingModel> Settings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Value converters for JSON serialization
            var dictionaryConverter = new ValueConverter<Dictionary<string, int>, string>(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                v => JsonSerializer.Deserialize<Dictionary<string, int>>(v, (JsonSerializerOptions?)null) ?? new Dictionary<string, int>()
            );

            var stringConverter = new ValueConverter<string?, string>(
                v => v ?? string.Empty,
                v => v
            );

            // Configure OrderModel
            modelBuilder.Entity<OrderModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Sizes).HasConversion(dictionaryConverter).HasColumnType("TEXT");
                entity.Property(e => e.Customer).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Article).IsRequired().HasMaxLength(200);
            });

            // Configure CustomerModel
            modelBuilder.Entity<CustomerModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Email).HasMaxLength(200);
                entity.Property(e => e.Phone).HasMaxLength(50);
                entity.Property(e => e.Address).HasMaxLength(500);
            });

            // Configure ShipmentModel
            modelBuilder.Entity<ShipmentModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderId).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.Property(e => e.TrackingNumber).HasMaxLength(100);
            });

            // Configure ProductionModel
            modelBuilder.Entity<ProductionModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderId).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Stage).IsRequired().HasMaxLength(100);
            });

            // Configure InspectionModel
            modelBuilder.Entity<InspectionModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderId).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Inspector).HasMaxLength(100);
            });

            // Configure PaymentModel
            modelBuilder.Entity<PaymentModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.OrderId).IsRequired();
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Method).HasMaxLength(50);
            });

            // Configure InventoryModel
            modelBuilder.Entity<InventoryModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ItemName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.Location).HasMaxLength(100);
            });

            // Configure ReportModel
            modelBuilder.Entity<ReportModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Type).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Data).HasConversion(stringConverter).HasColumnType("TEXT");
            });

            // Configure SettingModel
            modelBuilder.Entity<SettingModel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Value).HasMaxLength(1000);
            });
        }
    }
} 