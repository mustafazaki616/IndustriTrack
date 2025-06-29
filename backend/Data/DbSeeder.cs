using backend.Models;

namespace backend.Data
{
    public static class DbSeeder
    {
        public static async Task SeedData(IndustriTrackContext context)
        {
            // Check if data already exists
            bool hasOrders = context.Orders.Any();
            bool hasShipments = context.Shipments.Any();

            if (!hasOrders)
            {
                // Seed Orders
                var orders = new List<OrderModel>
                {
                    new OrderModel
                    {
                        Customer = "Acme Corp",
                        Article = "Leather Jacket",
                        Sizes = new Dictionary<string, int> { { "XS", 10 }, { "S", 20 }, { "M", 30 }, { "L", 25 }, { "XL", 15 } },
                        TotalQuantity = 100,
                        Status = "In Production",
                        Price = 299.99m,
                        Notes = "Premium leather quality required",
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new OrderModel
                    {
                        Customer = "Beta Textiles",
                        Article = "Denim Shirt",
                        Sizes = new Dictionary<string, int> { { "XS", 5 }, { "S", 15 }, { "M", 25 }, { "L", 20 }, { "XL", 10 } },
                        TotalQuantity = 75,
                        Status = "Completed",
                        Price = 89.99m,
                        Notes = "Standard denim finish",
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new OrderModel
                    {
                        Customer = "Fashion Forward",
                        Article = "Suede Vest",
                        Sizes = new Dictionary<string, int> { { "S", 12 }, { "M", 18 }, { "L", 15 }, { "XL", 8 } },
                        TotalQuantity = 53,
                        Status = "Pending",
                        Price = 199.99m,
                        Notes = "Custom color: burgundy",
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    }
                };

                context.Orders.AddRange(orders);
            }

            if (!context.Customers.Any())
            {
                // Seed Customers
                var customers = new List<CustomerModel>
                {
                    new CustomerModel
                    {
                        Name = "Acme Corporation",
                        Email = "orders@acme.com",
                        Phone = "+1-555-0123",
                        Address = "123 Business Ave, New York, NY 10001",
                        Company = "Acme Corp",
                        ContactPerson = "John Smith",
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    },
                    new CustomerModel
                    {
                        Name = "Beta Textiles Ltd",
                        Email = "purchasing@betatextiles.com",
                        Phone = "+1-555-0456",
                        Address = "456 Industry Blvd, Los Angeles, CA 90210",
                        Company = "Beta Textiles",
                        ContactPerson = "Sarah Johnson",
                        CreatedAt = DateTime.UtcNow.AddDays(-25)
                    },
                    new CustomerModel
                    {
                        Name = "Fashion Forward Inc",
                        Email = "orders@fashionforward.com",
                        Phone = "+1-555-0789",
                        Address = "789 Style Street, Miami, FL 33101",
                        Company = "Fashion Forward",
                        ContactPerson = "Mike Davis",
                        CreatedAt = DateTime.UtcNow.AddDays(-20)
                    }
                };

                context.Customers.AddRange(customers);
            }

            if (!context.Inventory.Any())
            {
                // Seed Inventory
                var inventory = new List<InventoryModel>
                {
                    new InventoryModel
                    {
                        ItemName = "Premium Leather",
                        Category = "Raw Materials",
                        Location = "Warehouse A",
                        Quantity = 500,
                        Unit = "sq ft",
                        MinStock = 100,
                        MaxStock = 1000,
                        Supplier = "LeatherCo Inc",
                        Cost = 25.50m
                    },
                    new InventoryModel
                    {
                        ItemName = "Denim Fabric",
                        Category = "Raw Materials",
                        Location = "Warehouse B",
                        Quantity = 800,
                        Unit = "yards",
                        MinStock = 200,
                        MaxStock = 1500,
                        Supplier = "DenimWorld",
                        Cost = 12.75m
                    },
                    new InventoryModel
                    {
                        ItemName = "Suede Material",
                        Category = "Raw Materials",
                        Location = "Warehouse A",
                        Quantity = 300,
                        Unit = "sq ft",
                        MinStock = 50,
                        MaxStock = 500,
                        Supplier = "SuedeSupply",
                        Cost = 35.00m
                    }
                };

                context.Inventory.AddRange(inventory);
            }

            if (!context.Settings.Any())
            {
                // Seed Settings
                var settings = new List<SettingModel>
                {
                    new SettingModel
                    {
                        Key = "FactoryName",
                        Value = "IndustriTrack",
                        Description = "Name of the factory",
                        Category = "General",
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    },
                    new SettingModel
                    {
                        Key = "Timezone",
                        Value = "UTC+0",
                        Description = "Factory timezone",
                        Category = "General",
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    },
                    new SettingModel
                    {
                        Key = "DefaultCurrency",
                        Value = "USD",
                        Description = "Default currency for transactions",
                        Category = "Financial",
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    },
                    new SettingModel
                    {
                        Key = "LowStockThreshold",
                        Value = "10",
                        Description = "Minimum stock level before alert",
                        Category = "Inventory",
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    }
                };

                context.Settings.AddRange(settings);
            }

            // Always seed shipments if they don't exist
            if (!hasShipments)
            {
                // Seed Shipments
                var shipments = new List<ShipmentModel>
                {
                    new ShipmentModel
                    {
                        OrderId = 1,
                        Status = "Shipped",
                        TrackingNumber = "TRK123456789",
                        ShippingAddress = "123 Business Ave, New York, NY 10001",
                        Carrier = "FedEx",
                        ShippingCost = 25.99m,
                        EstimatedDelivery = DateTime.UtcNow.AddDays(3),
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new ShipmentModel
                    {
                        OrderId = 2,
                        Status = "Delivered",
                        TrackingNumber = "TRK987654321",
                        ShippingAddress = "456 Industry Blvd, Los Angeles, CA 90210",
                        Carrier = "UPS",
                        ShippingCost = 19.99m,
                        EstimatedDelivery = DateTime.UtcNow.AddDays(-1),
                        ActualDelivery = DateTime.UtcNow.AddDays(-1),
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new ShipmentModel
                    {
                        OrderId = 3,
                        Status = "Pending",
                        TrackingNumber = null,
                        ShippingAddress = "789 Style Street, Miami, FL 33101",
                        Carrier = "DHL",
                        ShippingCost = 32.50m,
                        EstimatedDelivery = DateTime.UtcNow.AddDays(7),
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    }
                };

                context.Shipments.AddRange(shipments);
            }

            // Always seed productions if they don't exist
            if (!context.Productions.Any())
            {
                var productions = new List<ProductionModel>
                {
                    new ProductionModel
                    {
                        OrderId = 1,
                        Stage = "Cutting",
                        Status = "In Progress",
                        AssignedWorker = "Alice",
                        StartDate = DateTime.UtcNow.AddDays(-4),
                        ExpectedDuration = 2,
                        ActualDuration = 3,
                        CompletionDate = DateTime.UtcNow.AddDays(-1),
                        Notes = "Delayed due to material shortage",
                        CreatedAt = DateTime.UtcNow.AddDays(-4)
                    },
                    new ProductionModel
                    {
                        OrderId = 1,
                        Stage = "Stitching",
                        Status = "Pending",
                        AssignedWorker = "Bob",
                        StartDate = DateTime.UtcNow.AddDays(-1),
                        ExpectedDuration = 2,
                        Notes = "Ready to start",
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new ProductionModel
                    {
                        OrderId = 2,
                        Stage = "Finishing",
                        Status = "Completed",
                        AssignedWorker = "Charlie",
                        StartDate = DateTime.UtcNow.AddDays(-8),
                        ExpectedDuration = 3,
                        ActualDuration = 3,
                        CompletionDate = DateTime.UtcNow.AddDays(-5),
                        Notes = "On time",
                        CreatedAt = DateTime.UtcNow.AddDays(-8)
                    },
                    new ProductionModel
                    {
                        OrderId = 3,
                        Stage = "Quality Check",
                        Status = "Pending",
                        AssignedWorker = "Dana",
                        StartDate = DateTime.UtcNow.AddDays(1),
                        ExpectedDuration = 1,
                        Notes = "Scheduled for tomorrow",
                        CreatedAt = DateTime.UtcNow
                    }
                };
                context.Productions.AddRange(productions);
            }

            await context.SaveChangesAsync();
        }
    }
} 