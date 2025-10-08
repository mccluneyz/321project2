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
                .OrderByDescending(u => u.Points)
                .Take(10)
                .ToList();

            return View(topUsers);
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
