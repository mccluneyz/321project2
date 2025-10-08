using Microsoft.EntityFrameworkCore;
using RecycleRank.Models;

namespace RecycleRank.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Ensure database is created
            context.Database.EnsureCreated();

            // Check if data already exists
            if (context.Materials.Any())
            {
                return; // Database has been seeded
            }

            // Seed Materials
            var materials = new Material[]
            {
                new Material { Name = "Plastic Bottles", PointsPerUnit = 10 },
                new Material { Name = "Glass Bottles", PointsPerUnit = 15 },
                new Material { Name = "Aluminum Cans", PointsPerUnit = 20 },
                new Material { Name = "Cardboard", PointsPerUnit = 5 },
                new Material { Name = "Paper", PointsPerUnit = 8 }
            };

            foreach (var material in materials)
            {
                context.Materials.Add(material);
            }

            // Seed Ranks
            var ranks = new Rank[]
            {
                new Rank { Name = "Bronze", MinPoints = 0, MaxPoints = 99, Color = "#CD7F32" },
                new Rank { Name = "Silver", MinPoints = 100, MaxPoints = 299, Color = "#C0C0C0" },
                new Rank { Name = "Gold", MinPoints = 300, MaxPoints = 599, Color = "#FFD700" },
                new Rank { Name = "Platinum", MinPoints = 600, MaxPoints = 999, Color = "#E5E4E2" },
                new Rank { Name = "Diamond", MinPoints = 1000, MaxPoints = int.MaxValue, Color = "#B9F2FF" }
            };

            foreach (var rank in ranks)
            {
                context.Ranks.Add(rank);
            }

            // Seed Sample Bins
            var bins = new Bin[]
            {
                new Bin { Name = "Downtown Recycling Center", Latitude = 40.7128, Longitude = -74.0060, Address = "123 Main St, Downtown" },
                new Bin { Name = "Park Avenue Bin", Latitude = 40.7589, Longitude = -73.9851, Address = "456 Park Ave" },
                new Bin { Name = "Central Station Bin", Latitude = 40.7505, Longitude = -73.9934, Address = "789 Central Blvd" }
            };

            foreach (var bin in bins)
            {
                context.Bins.Add(bin);
            }

            context.SaveChanges();
        }
    }
}
