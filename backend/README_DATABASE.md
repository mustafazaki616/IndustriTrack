# PostgreSQL Database Setup for IndustriTrack

## Prerequisites

1. **Install PostgreSQL** on your system:
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Install .NET 9.0 SDK** (if not already installed)

## Database Setup

### 1. Start PostgreSQL Service

**Windows:**
- PostgreSQL service should start automatically after installation
- Or use Services app to start "postgresql-x64-15" service

**macOS/Linux:**
```bash
sudo service postgresql start
# or
brew services start postgresql
```

### 2. Create Database and User

Connect to PostgreSQL as the postgres user:

**Windows:**
```bash
psql -U postgres
```

**macOS/Linux:**
```bash
sudo -u postgres psql
```

Then run these SQL commands:
```sql
CREATE DATABASE industritrack;
CREATE USER industritrack_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE industritrack TO industritrack_user;
\q
```

### 3. Update Connection String

Edit `appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=industritrack;Username=industritrack_user;Password=your_password;Port=5432"
  }
}
```

### 4. Build and Run the Application

```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

The application will:
- Create all database tables automatically
- Seed initial data (orders, customers, inventory)
- Start the API server

## Database Features

### Entity Framework Core with PostgreSQL
- **JSONB Support**: Order sizes are stored as JSON for flexibility
- **Automatic Migrations**: Database schema is created automatically
- **Data Seeding**: Sample data is populated on first run

### Tables Created
- `Orders` - Order management with JSON sizes
- `Customers` - Customer information
- `Shipments` - Shipping and delivery tracking
- `Production` - Production line management
- `Inspections` - Quality control inspections
- `Payments` - Payment tracking
- `Inventory` - Stock management
- `Reports` - Report generation with JSON data
- `Settings` - Application configuration

### Sample Data
The database is seeded with:
- 3 sample orders (Leather Jacket, Denim Shirt, Suede Vest)
- 3 sample customers (Acme Corp, Beta Textiles, Fashion Forward)
- 3 inventory items (Premium Leather, Denim Fabric, Suede Material)

## Troubleshooting

### Connection Issues
1. Ensure PostgreSQL service is running
2. Check connection string in `appsettings.json`
3. Verify database and user exist
4. Check firewall settings

### Build Issues
1. Run `dotnet restore` to install packages
2. Ensure .NET 9.0 SDK is installed
3. Check for any compilation errors

### Database Reset
To reset the database:
1. Stop the application
2. Drop and recreate the database:
   ```sql
   DROP DATABASE industritrack;
   CREATE DATABASE industritrack;
   ```
3. Restart the application

## Production Deployment

For production:
1. Use a managed PostgreSQL service (AWS RDS, Azure Database, etc.)
2. Update connection string with production credentials
3. Enable SSL connections
4. Set up proper backup and monitoring
5. Use environment variables for sensitive connection strings 