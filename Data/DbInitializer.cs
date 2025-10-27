using Microsoft.EntityFrameworkCore;
using RecycleRank.Models;

namespace RecycleRank.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Apply any pending migrations
            context.Database.Migrate();

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

            // Add a test admin user
            var testAdmin = new User
            {
                Email = "admin@test.com",
                Password = "admin123",
                Name = "Test Admin",
                Points = 1000,
                TotalPointsEarned = 1000,
                Rank = RankLevel.Organic,
                IsAdmin = true
            };
            context.Users.Add(testAdmin);

            // Seed Battle Pass Tiers (Expanded to 20 tiers)
            var battlePassTiers = new BattlePassTier[]
            {
                new BattlePassTier { TierNumber = 1, RequiredPoints = 25, RewardType = "avatar", RewardName = "Eco Starter", RewardDescription = "Basic recycling avatar", RewardValue = "🌱", IsFree = true, Icon = "🌱" },
                new BattlePassTier { TierNumber = 2, RequiredPoints = 50, RewardType = "title", RewardName = "Green Thumb", RewardDescription = "Show off your eco-friendly nature", RewardValue = "Green Thumb", IsFree = true, Icon = "🌿" },
                new BattlePassTier { TierNumber = 3, RequiredPoints = 75, RewardType = "avatar", RewardName = "Recycle Master", RewardDescription = "Advanced recycler avatar", RewardValue = "♻️", IsFree = true, Icon = "♻️" },
                new BattlePassTier { TierNumber = 4, RequiredPoints = 100, RewardType = "banner", RewardName = "Forest Banner", RewardDescription = "Beautiful forest background", RewardValue = "🌲🌲🌲", IsFree = true, Icon = "🌲" },
                new BattlePassTier { TierNumber = 5, RequiredPoints = 150, RewardType = "title", RewardName = "Eco Warrior", RewardDescription = "Champion of the environment", RewardValue = "Eco Warrior", IsFree = true, Icon = "⚔️" },
                new BattlePassTier { TierNumber = 6, RequiredPoints = 200, RewardType = "avatar", RewardName = "Diamond Recycler", RewardDescription = "Elite recycling avatar", RewardValue = "💎", IsFree = true, Icon = "💎" },
                new BattlePassTier { TierNumber = 7, RequiredPoints = 300, RewardType = "banner", RewardName = "Ocean Banner", RewardDescription = "Calming ocean waves", RewardValue = "🌊🌊🌊", IsFree = true, Icon = "🌊" },
                new BattlePassTier { TierNumber = 8, RequiredPoints = 400, RewardType = "title", RewardName = "Planet Protector", RewardDescription = "Guardian of Earth", RewardValue = "Planet Protector", IsFree = true, Icon = "🛡️" },
                new BattlePassTier { TierNumber = 9, RequiredPoints = 500, RewardType = "avatar", RewardName = "Solar Recycler", RewardDescription = "Solar-powered recycling avatar", RewardValue = "☀️", IsFree = true, Icon = "☀️" },
                new BattlePassTier { TierNumber = 10, RequiredPoints = 600, RewardType = "banner", RewardName = "Mountain Banner", RewardDescription = "Majestic mountain landscape", RewardValue = "🏔️🏔️🏔️", IsFree = true, Icon = "🏔️" },
                new BattlePassTier { TierNumber = 11, RequiredPoints = 750, RewardType = "title", RewardName = "Eco Legend", RewardDescription = "Legendary environmentalist", RewardValue = "Eco Legend", IsFree = true, Icon = "👑" },
                new BattlePassTier { TierNumber = 12, RequiredPoints = 900, RewardType = "avatar", RewardName = "Wind Recycler", RewardDescription = "Wind-powered recycling avatar", RewardValue = "💨", IsFree = true, Icon = "💨" },
                new BattlePassTier { TierNumber = 13, RequiredPoints = 1100, RewardType = "banner", RewardName = "Desert Banner", RewardDescription = "Beautiful desert sunset", RewardValue = "🏜️🏜️🏜️", IsFree = true, Icon = "🏜️" },
                new BattlePassTier { TierNumber = 14, RequiredPoints = 1300, RewardType = "title", RewardName = "Climate Hero", RewardDescription = "Hero of climate action", RewardValue = "Climate Hero", IsFree = true, Icon = "🦸" },
                new BattlePassTier { TierNumber = 15, RequiredPoints = 1500, RewardType = "avatar", RewardName = "Rainbow Recycler", RewardDescription = "Colorful recycling avatar", RewardValue = "🌈", IsFree = true, Icon = "🌈" },
                new BattlePassTier { TierNumber = 16, RequiredPoints = 1800, RewardType = "banner", RewardName = "Arctic Banner", RewardDescription = "Cool arctic landscape", RewardValue = "❄️❄️❄️", IsFree = true, Icon = "❄️" },
                new BattlePassTier { TierNumber = 17, RequiredPoints = 2100, RewardType = "title", RewardName = "Earth Guardian", RewardDescription = "Ultimate protector of Earth", RewardValue = "Earth Guardian", IsFree = true, Icon = "🌍" },
                new BattlePassTier { TierNumber = 18, RequiredPoints = 2500, RewardType = "avatar", RewardName = "Cosmic Recycler", RewardDescription = "Space-age recycling avatar", RewardValue = "🚀", IsFree = true, Icon = "🚀" },
                new BattlePassTier { TierNumber = 19, RequiredPoints = 3000, RewardType = "banner", RewardName = "Galaxy Banner", RewardDescription = "Stunning galaxy background", RewardValue = "🌌🌌🌌", IsFree = true, Icon = "🌌" },
                new BattlePassTier { TierNumber = 20, RequiredPoints = 5000, RewardType = "title", RewardName = "Recycling God", RewardDescription = "Supreme recycling deity", RewardValue = "Recycling God", IsFree = true, Icon = "⚡" }
            };

            foreach (var tier in battlePassTiers)
            {
                context.BattlePassTiers.Add(tier);
            }

            // Seed Shop Items
            var shopItems = new ShopItem[]
            {
                new ShopItem { Name = "Golden Avatar", Description = "Shiny golden recycling avatar", Cost = 200, ItemType = "avatar", ItemValue = "✨", Icon = "✨" },
                new ShopItem { Name = "Rainbow Banner", Description = "Colorful rainbow background", Cost = 300, ItemType = "banner", ItemValue = "🌈🌈🌈", Icon = "🌈" },
                new ShopItem { Name = "VIP Title", Description = "Exclusive VIP member title", Cost = 500, ItemType = "title", ItemValue = "VIP Member", Icon = "👑" },
                new ShopItem { Name = "Space Avatar", Description = "Cosmic recycling avatar", Cost = 400, ItemType = "avatar", ItemValue = "🚀", Icon = "🚀" },
                new ShopItem { Name = "Galaxy Banner", Description = "Stunning galaxy background", Cost = 600, ItemType = "banner", ItemValue = "🌌🌌🌌", Icon = "🌌" },
                new ShopItem { Name = "Legend Title", Description = "Legendary recycler title", Cost = 800, ItemType = "title", ItemValue = "Legend", Icon = "🏆" },
                new ShopItem { Name = "Fire Avatar", Description = "Flaming recycling avatar", Cost = 350, ItemType = "avatar", ItemValue = "🔥", Icon = "🔥" },
                new ShopItem { Name = "Sunset Banner", Description = "Beautiful sunset background", Cost = 450, ItemType = "banner", ItemValue = "🌅🌅🌅", Icon = "🌅" }
            };

            foreach (var item in shopItems)
            {
                context.ShopItems.Add(item);
            }

            context.Users.Add(testAdmin);
            context.SaveChanges(); // Save the user first to get the ID

            // Add some sample UserRewards for the test admin
            var testAdminRewards = new UserReward[]
            {
                new UserReward { UserId = testAdmin.Id, RewardType = "title", RewardName = "Eco Legend", RewardValue = "Eco Legend", IsEquipped = true, UnlockedAt = DateTime.Now.AddDays(-1) },
                new UserReward { UserId = testAdmin.Id, RewardType = "avatar", RewardName = "Eco Starter", RewardValue = "🌱", IsEquipped = true, UnlockedAt = DateTime.Now.AddDays(-2) },
                new UserReward { UserId = testAdmin.Id, RewardType = "banner", RewardName = "Forest Banner", RewardValue = "🌲🌲🌲", IsEquipped = true, UnlockedAt = DateTime.Now.AddDays(-3) }
            };

            foreach (var reward in testAdminRewards)
            {
                context.UserRewards.Add(reward);
            }

            // Seed Sample Events
            var events = new Event[]
            {
                new Event 
                { 
                    Title = "Campus Cleanup Day", 
                    Description = "Join us for a campus-wide cleanup event! We'll be collecting recyclables and cleaning up the quad area.", 
                    EventDate = DateTime.Now.AddDays(3), 
                    CreatedAt = DateTime.Now, 
                    CreatedByUserId = testAdmin.Id, 
                    Location = "The Quad, University of Alabama",
                    IsActive = true
                },
                new Event 
                { 
                    Title = "Recycling Competition", 
                    Description = "Compete with fellow students to see who can recycle the most! Prizes for top recyclers.", 
                    EventDate = DateTime.Now.AddDays(7), 
                    CreatedAt = DateTime.Now, 
                    CreatedByUserId = testAdmin.Id, 
                    Location = "Gorgas Library",
                    IsActive = true
                },
                new Event 
                { 
                    Title = "Eco-Friendly Workshop", 
                    Description = "Learn about sustainable living and advanced recycling techniques. Free refreshments provided!", 
                    EventDate = DateTime.Now.AddDays(14), 
                    CreatedAt = DateTime.Now, 
                    CreatedByUserId = testAdmin.Id, 
                    Location = "Student Center",
                    IsActive = true
                },
                new Event 
                { 
                    Title = "Earth Day Celebration", 
                    Description = "Join us for our annual Earth Day celebration with games, prizes, and educational booths!", 
                    EventDate = DateTime.Now.AddDays(21), 
                    CreatedAt = DateTime.Now, 
                    CreatedByUserId = testAdmin.Id, 
                    Location = "Bryant-Denny Stadium",
                    IsActive = true
                }
            };

            foreach (var evt in events)
            {
                context.Events.Add(evt);
            }

            context.SaveChanges();
        }
    }
}
