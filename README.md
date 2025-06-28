# IndustriTrack - Industrial Manufacturing Management System

A comprehensive full-stack web application for managing industrial manufacturing operations, built with ASP.NET Core, React, and Python.

## 🚀 Features

- **Order Management**: Upload, track, and manage manufacturing orders
- **Customer Management**: Store and manage customer information
- **Production Tracking**: Monitor production stages and status
- **Quality Control**: Inspection management and tracking
- **Inventory Management**: Stock tracking and management
- **Financial Tracking**: Payment processing and status
- **Reporting**: Generate and view various business reports
- **Document Processing**: Extract data from PDF/Excel order files

## 🛠️ Tech Stack

### Backend
- **ASP.NET Core 9.0** - Web API framework
- **Entity Framework Core** - ORM for database operations
- **SQLite** - Database (with PostgreSQL support)
- **Swagger/OpenAPI** - API documentation

### Frontend
- **React 19** - Frontend framework
- **Material-UI (MUI)** - UI component library
- **Chart.js** - Data visualization
- **React Router** - Client-side routing

### Additional Services
- **Python FastAPI** - Document processing service
- **PDF/Excel Parsing** - Order data extraction

## 📋 Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://python.org/) (v3.8 or higher)
- [Git](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/industritrack.git
cd industritrack
```

### 2. Backend Setup
```bash
cd backend
dotnet restore
dotnet build
dotnet run
```

The API will be available at: http://localhost:5123
API Documentation: http://localhost:5123/swagger

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The frontend will be available at: http://localhost:3000

### 4. Python Service (Optional)
```bash
cd ..
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install fastapi uvicorn pdfplumber pandas openpyxl
uvicorn extractor_service:app --reload --port 8000
```

## 📁 Project Structure

```
industritrack/
├── backend/                 # ASP.NET Core API
│   ├── Controllers/        # API endpoints
│   ├── Data/              # Database context
│   ├── Models/            # Entity models
│   ├── Program.cs         # Application entry point
│   └── backend.csproj     # Project file
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Application pages
│   │   └── App.js         # Main application
│   └── package.json       # Dependencies
├── extractor_service.py   # Python document processor
├── README.md             # This file
└── .gitignore           # Git ignore rules
```

## 🔧 Configuration

### Database
The application uses SQLite by default. To switch to PostgreSQL:

1. Update connection string in `backend/appsettings.json`
2. Install PostgreSQL package: `dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL`
3. Update `Program.cs` to use `UseNpgsql()`

### Environment Variables
Create `.env` files for environment-specific configurations.

## 📊 API Endpoints

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/customers` - Get all customers
- `GET /api/inventory` - Get inventory items
- `GET /api/reports` - Get reports
- And many more...

## 🧪 Testing

### Backend Tests
```bash
cd backend
dotnet test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
dotnet publish -c Release
```

### Frontend Deployment
```bash
cd frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- [Your Name] - Full Stack Developer
- [Team Member 1] - Backend Developer
- [Team Member 2] - Frontend Developer

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the development team.

## 🔄 Version History

- **v1.0.0** - Initial release with core manufacturing management features
- **v1.1.0** - Added document processing capabilities
- **v1.2.0** - Enhanced reporting and analytics

---

**Made with ❤️ by the IndustriTrack Team** 