# ♻️ R3cycle - Social Recycling Platform

A modern web application built with .NET 8 MVC that gamifies recycling and encourages environmental sustainability through social features, leaderboards, and community challenges.

## 🚀 Quick Start (Zero Setup Required!)

### Prerequisites
- **.NET 8 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Git** - [Download here](https://git-scm.com/downloads)
- **Any code editor** (VS Code, Visual Studio, Rider, etc.)

### Team Setup (2 minutes)
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Group-9-Application.git
cd Group-9-Application

# 2. Restore packages
dotnet restore

# 3. Run the application
dotnet run
```

**That's it!** 🎉 Open `http://localhost:5000` in your browser.

## 🎯 Project Overview

### 🌟 Features
- **Social Feed** - See community recycling achievements
- **Leaderboards** - Compete with friends and neighbors
- **Recycling Tracking** - Log your recycling activities
- **Interactive Map** - Find recycling bins near you
- **Admin Dashboard** - Manage bins, materials, and users
- **Points System** - Earn points for recycling different materials

### 🏗️ Architecture
- **Backend**: .NET 8 MVC with Entity Framework Core
- **Database**: SQLite (zero setup, works everywhere)
- **Frontend**: Bootstrap 5 + Custom CSS
- **Authentication**: ASP.NET Identity (ready for implementation)

## 📁 Project Structure

```
Group-9-Application/
├── Controllers/           # MVC Controllers
│   ├── HomeController.cs
│   ├── AdminController.cs
│   ├── RecyclingController.cs
│   └── LeaderboardController.cs
├── Models/               # Data Models
│   ├── User.cs
│   ├── Bin.cs
│   ├── Material.cs
│   └── RecyclingEvent.cs
├── Views/                # Razor Views
│   ├── Home/            # Homepage with social feed
│   ├── Admin/           # Admin dashboard
│   ├── Recycling/       # Recycling logging & map
│   └── Shared/          # Layout & partials
├── Data/                # Database Context
│   ├── ApplicationDbContext.cs
│   └── DbInitializer.cs
└── wwwroot/            # Static files (CSS, JS, images)
```

## 🎨 Current UI Features

### 🏠 Homepage
- **Community Stats** - Live recycling statistics
- **Social Feed** - Instagram-style posts from users
- **Welcome Modal** - Onboarding for new users
- **Guest Mode** - Browse without signing up

### 🧭 Navigation
- **Fixed Banner** - Always visible navigation
- **Icon Buttons** - Quick access to all sections
- **Responsive Design** - Works on all devices

### 📱 Pages Available
- **Home** (`/`) - Community dashboard
- **Recycling** (`/Recycling/Index`) - Log activities
- **Map** (`/Recycling/Map`) - Find bins
- **Leaderboard** (`/Leaderboard/Index`) - Rankings
- **Admin** (`/Admin/Index`) - Management tools

## 🛠️ Development Workflow

### For Team Members

#### 🎯 Working on Features
1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test locally:
   ```bash
   dotnet run
   ```

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add: Your feature description"
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub

#### 🔧 Common Commands
```bash
# Run the application
dotnet run

# Build the project
dotnet build

# Restore packages
dotnet restore

# Run tests (when added)
dotnet test

# Update database (when migrations are added)
dotnet ef database update
```

## 🗄️ Database Information

### SQLite Setup (Current)
- **File**: `RecycleRank.db` (auto-created)
- **Location**: Project root
- **Backup**: Included in .gitignore (each dev gets their own)
- **Seeding**: Automatic with sample data

### Sample Data Included
- **Materials**: Plastic, Glass, Paper, Metal (with point values)
- **Bins**: 5 sample recycling locations
- **Users**: Demo users for testing
- **Ranks**: Bronze, Silver, Gold, Platinum, Diamond

## 🎯 Development Areas

### ✅ Completed
- [x] Project scaffolding
- [x] Database setup (SQLite)
- [x] Bootstrap 5 UI framework
- [x] Basic controllers & views
- [x] Instagram-style homepage
- [x] Social feed layout
- [x] Navigation system
- [x] Responsive design

### 🚧 In Progress
- [ ] User authentication system
- [ ] Recycling activity logging
- [ ] Points calculation system
- [ ] Real-time leaderboard updates

### 📝 Next Steps
- [ ] Interactive map integration
- [ ] Admin management features
- [ ] User profile pages
- [ ] Push notifications
- [ ] Mobile app (future)

## 👥 Team Roles & Responsibilities

### 🎨 Frontend Developer
**Focus**: UI/UX, styling, animations
- Work in: `Views/`, `wwwroot/css/`, `wwwroot/js/`
- Enhance: Social feed, animations, mobile responsiveness
- Tools: Bootstrap 5, CSS3, JavaScript

### 🔧 Backend Developer
**Focus**: Controllers, business logic, API
- Work in: `Controllers/`, `Models/`, `Data/`
- Implement: Authentication, recycling logic, admin features
- Tools: C#, Entity Framework, ASP.NET Core

### 🗺️ Map Integration Specialist
**Focus**: Location services, mapping
- Work in: `Views/Recycling/Map.cshtml`, mapping APIs
- Implement: Google Maps, bin locations, geolocation
- Tools: Google Maps API, JavaScript

### 🎮 Gamification Expert
**Focus**: Points, achievements, leaderboards
- Work in: `Models/`, `Controllers/LeaderboardController.cs`
- Implement: Scoring system, badges, challenges
- Tools: C#, database queries

## 🐛 Troubleshooting

### Common Issues

#### App Won't Start
```bash
# Check .NET version
dotnet --version

# Restore packages
dotnet restore

# Clean and rebuild
dotnet clean
dotnet build
```

#### Database Issues
```bash
# Delete database file and restart
rm RecycleRank.db
dotnet run
```

#### Port Already in Use
```bash
# Kill existing processes
taskkill /f /im dotnet.exe
dotnet run
```

#### Banner Not Showing
- Hard refresh browser (Ctrl+F5)
- Check browser console for errors
- Ensure `Views/_ViewStart.cshtml` exists

## 📞 Support

### Getting Help
1. **Check this README** first
2. **Ask in team chat** for quick questions
3. **Create GitHub issue** for bugs
4. **Review code** in pull requests

### Useful Resources
- [.NET 8 Documentation](https://docs.microsoft.com/en-us/dotnet/)
- [ASP.NET Core MVC](https://docs.microsoft.com/en-us/aspnet/core/mvc/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/)

## 🚀 Deployment

### Local Development
```bash
dotnet run
# App runs on http://localhost:5000
```

### Production (Future)
- Azure App Service
- Docker containers
- CI/CD with GitHub Actions

---

## 📝 License

This project is for educational purposes (MIS321 Group 9).

---

**Happy Coding!** 🌱♻️✨

*Built with ❤️ by Group 9*