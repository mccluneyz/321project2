using Microsoft.AspNetCore.Mvc;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class LeaderboardController : Controller
    {
        private readonly ApplicationDbContext _context;

        public LeaderboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            // TODO: Implement leaderboard logic with top users
            var topUsers = _context.Users
                .OrderByDescending(u => u.TotalPointsEarned)
                .Take(10)
                .ToList();

            // Get equipped titles for each user
            var userRewards = _context.UserRewards
                .Where(ur => ur.IsEquipped && ur.RewardType == "title")
                .ToList();

            ViewBag.GetRankStyle = new Func<RankLevel, RankStyle>(GetRankStyle);
            ViewBag.UserRewards = userRewards;
            return View(topUsers);
        }

        private RankStyle GetRankStyle(RankLevel rank)
        {
            return rank switch
            {
                RankLevel.Plastic => new RankStyle { Icon = "♻️", Color = "#28a745", GlowColor = "#28a745" },
                RankLevel.Glass => new RankStyle { Icon = "🪟", Color = "#17a2b8", GlowColor = "#17a2b8" },
                RankLevel.Paper => new RankStyle { Icon = "📄", Color = "#ffc107", GlowColor = "#ffc107" },
                RankLevel.Metal => new RankStyle { Icon = "⚙️", Color = "#6c757d", GlowColor = "#6c757d" },
                RankLevel.Organic => new RankStyle { Icon = "🌟", Color = "#fd7e14", GlowColor = "#fd7e14" },
                _ => new RankStyle { Icon = "♻️", Color = "#28a745", GlowColor = "#28a745" }
            };
        }

        public IActionResult Local()
        {
            // TODO: Implement local leaderboard logic
            return View();
        }

        public IActionResult Global()
        {
            // TODO: Implement global leaderboard logic
            return View();
        }
    }
}
