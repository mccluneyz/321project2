using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class ProfileController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null)
            {
                return RedirectToAction("Login", "Account");
            }

            return View(user);
        }

        [HttpPost]
        public IActionResult UpdateProfile(string name, string profilePicture)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = _context.Users.Find(userId);
            if (user == null)
            {
                return RedirectToAction("Login", "Account");
            }

            if (!string.IsNullOrEmpty(name))
            {
                user.Name = name;
            }

            if (!string.IsNullOrEmpty(profilePicture))
            {
                user.ProfilePicture = profilePicture;
            }

            _context.SaveChanges();

            // Update session
            HttpContext.Session.SetString("UserName", user.Name);

            return RedirectToAction("Index");
        }

        public IActionResult History()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            // Get user's recycling events with related data
            var userEvents = _context.RecyclingEvents
                .Include(re => re.Bin)
                .Where(re => re.UserId == userId)
                .OrderByDescending(re => re.CreatedAt)
                .ToList();

            var user = _context.Users.Find(userId);
            
            // Debug: Log the number of events found
            System.Diagnostics.Debug.WriteLine($"Found {userEvents.Count} events for user {userId}");
            
            ViewBag.User = user;
            ViewBag.Events = userEvents;
            
            return View();
        }
    }
}

