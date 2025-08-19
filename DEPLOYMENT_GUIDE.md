# IndustriTrack Backend Deployment Guide

## 📦 Deployment Package Ready

Your backend application has been successfully built and is ready for deployment. The compiled application is located in:
```
backend/publish/
```

## 🚀 Deployment Options

### Option 1: Somee.com (Free .NET Hosting)

**Steps:**
1. Visit [somee.com](https://somee.com) and create a free account
2. Create a new website with ASP.NET Core support
3. Upload the contents of the `backend/publish/` folder via FTP or file manager
4. Update your database connection string in the hosting control panel
5. Your API will be available at: `https://yoursitename.somee.com`

### Option 2: Azure App Service (Free Tier)

**Prerequisites:**
- Install Azure CLI: `winget install Microsoft.AzureCLI`
- Create Azure account (free tier available)

**Steps:**
1. Login: `az login`
2. Create resource group: `az group create --name IndustriTrack --location "East US"`
3. Create app service plan: `az appservice plan create --name IndustriTrackPlan --resource-group IndustriTrack --sku FREE`
4. Create web app: `az webapp create --resource-group IndustriTrack --plan IndustriTrackPlan --name industri-track-api --runtime "DOTNETCORE|8.0"`
5. Deploy: `az webapp deployment source config-zip --resource-group IndustriTrack --name industri-track-api --src publish.zip`

### Option 3: Railway (Docker-based)

**Steps:**
1. Push your code to GitHub
2. Connect Railway to your GitHub repository
3. Railway will automatically detect the Dockerfile and deploy
4. Your API will be available at the provided Railway URL

### Option 4: Render (Docker-based)

**Steps:**
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Select "Docker" as the environment
5. Render will build and deploy using your Dockerfile

## 🔧 Configuration Files Included

- ✅ `Dockerfile` - For containerized deployment
- ✅ `web.config` - For IIS deployment
- ✅ `appsettings.Production.json` - Production configuration
- ✅ `railway.json` - Railway deployment configuration

## 🌐 CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `https://industri-track-frontend-c9aa8o08b-zakis-projects-a97e61f1.vercel.app` (your current frontend)
- `https://*.vercel.app` (all Vercel deployments)

## 📝 Next Steps

1. **Choose a hosting option** from above
2. **Deploy the backend** using your preferred method
3. **Update frontend environment variable** with your deployed backend URL
4. **Test the complete application**

## 🔗 Frontend Environment Update

Once your backend is deployed, update your frontend's environment variable:

**File:** `frontend/.env.production`
```
REACT_APP_API_URL=https://your-deployed-backend-url.com
```

## 🛠️ Troubleshooting

- **Database Issues**: The app uses SQLite by default. For production, consider upgrading to PostgreSQL or SQL Server
- **CORS Errors**: Add your deployed frontend URL to the CORS policy in `Program.cs`
- **Port Issues**: The app is configured to use the PORT environment variable or default to 8080

## 📞 Support

If you encounter issues with any deployment method, refer to the respective platform's documentation or contact their support.