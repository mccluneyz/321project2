using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecycleRank.Data;
using RecycleRank.Models;
using RecycleRank.Services;

namespace RecycleRank.Controllers
{
    public class RecyclingController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly PointsService _pointsService;

        public RecyclingController(ApplicationDbContext context, PointsService pointsService)
        {
            _context = context;
            _pointsService = pointsService;
        }

        public IActionResult Index()
        {
            var bins = _context.Bins.ToList();
            var materials = _context.Materials.ToList();
            
            ViewBag.Bins = bins;
            ViewBag.Materials = materials;
            
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> LogRecycling(int binId, string material, int quantity)
        {
            // Get current user from session
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                TempData["Error"] = "Please log in to record recycling activities.";
                return RedirectToAction("Index");
            }

            // Find the material to get points per unit
            var materialRecord = _context.Materials.FirstOrDefault(m => m.Name == material);
            if (materialRecord == null)
            {
                TempData["Error"] = "Invalid material selected.";
                return RedirectToAction("Index");
            }

            // Get user to calculate points with rank multiplier
            var user = _context.Users.Find(userId.Value);
            if (user == null)
            {
                TempData["Error"] = "User not found.";
                return RedirectToAction("Index");
            }

            // Calculate points earned with rank multiplier
            var oldRank = user.Rank;
            int pointsEarned = _pointsService.CalculatePoints(user, materialRecord, quantity);

            // Create recycling event
            var recyclingEvent = new RecyclingEvent
            {
                UserId = userId.Value,
                BinId = binId,
                Material = material,
                Quantity = quantity,
                CreatedAt = DateTime.Now
            };

            // Add recycling event to database
            _context.RecyclingEvents.Add(recyclingEvent);

            // Award points (this will also check for rank promotion)
            await _pointsService.AwardPointsAsync(userId.Value, pointsEarned);
            
            // Refresh user from database to get updated rank
            _context.Entry(user).Reload();
            
            // Update session with new points and rank
            HttpContext.Session.SetInt32("UserPoints", user.Points);
            HttpContext.Session.SetString("UserRank", user.Rank.ToString());

            // Check if user was promoted
            string promotionMessage = "";
            if (oldRank != user.Rank)
            {
                promotionMessage = $" 🎉 CONGRATULATIONS! You've been promoted to {user.Rank} rank!";
            }

            TempData["Success"] = $"Successfully logged {quantity} {material} item(s) and earned {pointsEarned} points! Total points: {user.Points}{promotionMessage}";
            return RedirectToAction("Index");
        }

        public IActionResult Map()
        {
            var bins = _context.Bins.ToList();
            return View(bins);
        }

        public IActionResult Events()
        {
            var events = _context.Events
                .Include(e => e.CreatedByUser)
                .Where(e => e.IsActive && e.EventDate >= DateTime.Now)
                .OrderBy(e => e.EventDate)
                .ToList();
            
            // Check if current user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            var isAdmin = false;
            if (userId.HasValue)
            {
                var user = _context.Users.Find(userId.Value);
                isAdmin = user?.IsAdmin ?? false;
            }
            
            ViewBag.IsAdmin = isAdmin;
            return View(events);
        }
    }
}
