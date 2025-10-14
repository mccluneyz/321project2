using RecycleRank.Data;
using RecycleRank.Models;
using Microsoft.EntityFrameworkCore;

namespace RecycleRank.Services
{
    public class PointsService
    {
        private readonly ApplicationDbContext _context;

        public PointsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public int CalculatePoints(User user, Material material, int quantity)
        {
            // Get base points from material
            var basePoints = material.PointsPerUnit * quantity;
            
            // Apply rank multiplier
            var multiplier = GetRankMultiplier(user.Rank);
            var finalPoints = (int)(basePoints * multiplier);
            
            return finalPoints;
        }

        public double GetRankMultiplier(RankLevel rank)
        {
            return rank switch
            {
                RankLevel.Plastic => 1.0,
                RankLevel.Glass => 1.1,
                RankLevel.Paper => 1.2,
                RankLevel.Metal => 1.3,
                RankLevel.Organic => 1.5,
                _ => 1.0
            };
        }

        public async Task<bool> AwardPointsAsync(int userId, int points)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            var oldRank = user.Rank;
            user.Points += points;
            user.TotalPointsEarned += points; // Track total lifetime points
            
            // Check for rank promotion based on total points earned
            var newRank = CalculateRank(user.TotalPointsEarned);
            if (newRank != oldRank)
            {
                user.Rank = newRank;
                // TODO: Add rank promotion notification/celebration
            }

            await _context.SaveChangesAsync();
            return true;
        }


        public RankLevel CalculateRank(int points)
        {
            return points switch
            {
                < 100 => RankLevel.Plastic,
                < 300 => RankLevel.Glass,
                < 600 => RankLevel.Paper,
                < 1000 => RankLevel.Metal,
                _ => RankLevel.Organic
            };
        }

        public int GetPointsToNextRank(RankLevel currentRank, int currentPoints)
        {
            var nextRankThreshold = currentRank switch
            {
                RankLevel.Plastic => 100,
                RankLevel.Glass => 300,
                RankLevel.Paper => 600,
                RankLevel.Metal => 1000,
                RankLevel.Organic => int.MaxValue, // Already at highest rank
                _ => 100
            };

            return Math.Max(0, nextRankThreshold - currentPoints);
        }
    }
}
