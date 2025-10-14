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
    }
}
