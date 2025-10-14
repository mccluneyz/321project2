using Microsoft.AspNetCore.Mvc;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class RecyclingController : Controller
    {
        private readonly ApplicationDbContext _context;

        public RecyclingController(ApplicationDbContext context)
        {
            _context = context;
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
        public IActionResult LogRecycling(int binId, string material, int quantity)
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

            // Calculate points earned
            int pointsEarned = quantity * materialRecord.PointsPerUnit;

            // Create a simple recycling event
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

            // Update user's points
            var user = _context.Users.Find(userId.Value);
            if (user != null)
            {
                user.Points += pointsEarned;
                
                // Update session with new points total
                HttpContext.Session.SetInt32("UserPoints", user.Points);
            }

            _context.SaveChanges();
            
            TempData["Success"] = $"Successfully logged {quantity} {material} item(s) and earned {pointsEarned} points! Total points: {user?.Points}";
            return RedirectToAction("Index");
        }

        public IActionResult Map()
        {
            var bins = _context.Bins.ToList();
            return View(bins);
        }
    }
}
