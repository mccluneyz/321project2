using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            // Get admin dashboard data
            var totalUsers = _context.Users.Count();
            var totalEvents = _context.RecyclingEvents.Count();
            var flaggedEvents = _context.RecyclingEvents.Count(e => e.IsFlagged);
            var totalBins = _context.Bins.Count();

            ViewBag.TotalUsers = totalUsers;
            ViewBag.TotalEvents = totalEvents;
            ViewBag.FlaggedEvents = flaggedEvents;
            ViewBag.TotalBins = totalBins;

            return View();
        }

        public IActionResult AllRecyclingEvents()
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var events = _context.RecyclingEvents
                .Include(e => e.User)
                .Include(e => e.Bin)
                .OrderByDescending(e => e.CreatedAt)
                .ToList();

            ViewBag.Events = events;
            return View(events);
        }

        public IActionResult FlaggedEvents()
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var flaggedEvents = _context.RecyclingEvents
                .Include(e => e.User)
                .Include(e => e.Bin)
                .Where(e => e.IsFlagged)
                .OrderByDescending(e => e.CreatedAt)
                .ToList();

            return View(flaggedEvents);
        }

        public IActionResult ManageUsers()
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var users = _context.Users.ToList();
            return View(users);
        }

        public IActionResult ManageBins()
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var bins = _context.Bins.ToList();
            return View(bins);
        }

        public IActionResult ManageMaterials()
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var materials = _context.Materials.ToList();
            return View(materials);
        }

        [HttpPost]
        public IActionResult ToggleFlag(int eventId)
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var recyclingEvent = _context.RecyclingEvents.Find(eventId);
            if (recyclingEvent != null)
            {
                recyclingEvent.IsFlagged = !recyclingEvent.IsFlagged;
                _context.SaveChanges();
                TempData["Success"] = $"Event {(recyclingEvent.IsFlagged ? "flagged" : "unflagged")} successfully.";
            }

            return RedirectToAction("AllRecyclingEvents");
        }

        [HttpPost]
        public IActionResult DeleteEvent(int eventId)
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var recyclingEvent = _context.RecyclingEvents.Find(eventId);
            if (recyclingEvent != null)
            {
                _context.RecyclingEvents.Remove(recyclingEvent);
                _context.SaveChanges();
                TempData["Success"] = "Event deleted successfully.";
            }

            return RedirectToAction("AllRecyclingEvents");
        }

        [HttpPost]
        public IActionResult CreateBin(string name, string address, double latitude, double longitude)
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var bin = new Bin
            {
                Name = name,
                Address = address,
                Latitude = latitude,
                Longitude = longitude
            };

            _context.Bins.Add(bin);
            _context.SaveChanges();
            TempData["Success"] = $"Recycling bin '{name}' added successfully! You can now see it on the map.";

            return RedirectToAction("Map", "Recycling");
        }

        [HttpPost]
        public IActionResult UpdateBin(int binId, string name, string address, double latitude, double longitude)
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var bin = _context.Bins.Find(binId);
            if (bin != null)
            {
                bin.Name = name;
                bin.Address = address;
                bin.Latitude = latitude;
                bin.Longitude = longitude;
                _context.SaveChanges();
                TempData["Success"] = $"Recycling bin '{name}' updated successfully!";
            }

            return RedirectToAction("Map", "Recycling");
        }

        [HttpPost]
        public IActionResult DeleteBin(int binId)
        {
            // Check if user is admin
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null || !user.IsAdmin)
            {
                return RedirectToAction("Index", "Home");
            }

            var bin = _context.Bins.Find(binId);
            if (bin != null)
            {
                var binName = bin.Name;
                _context.Bins.Remove(bin);
                _context.SaveChanges();
                TempData["Success"] = $"Recycling bin '{binName}' deleted successfully!";
            }

            return RedirectToAction("Map", "Recycling");
        }
    }
}
