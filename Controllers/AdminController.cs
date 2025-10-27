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
        public IActionResult FlagEvent(int eventId)
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
        public IActionResult RejectEvent(int eventId)
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
                // Find the user who created this event
                var eventUser = _context.Users.Find(recyclingEvent.UserId);
                if (eventUser != null)
                {
                    // Calculate points to remove (quantity * points per unit)
                    var material = _context.Materials.FirstOrDefault(m => m.Name == recyclingEvent.Material);
                    if (material != null)
                    {
                        var pointsToRemove = recyclingEvent.Quantity * material.PointsPerUnit;
                        
                        // Remove points from user's account
                        eventUser.Points -= pointsToRemove;
                        if (eventUser.Points < 0) eventUser.Points = 0; // Prevent negative points
                        
                        TempData["Success"] = $"Event rejected. Removed {pointsToRemove} points from {eventUser.Name}'s account.";
                    }
                    else
                    {
                        // If material not found, just remove a default amount or skip point removal
                        TempData["Success"] = $"Event rejected. Material '{recyclingEvent.Material}' not found in system.";
                    }
                }

                // Delete the event completely
                _context.RecyclingEvents.Remove(recyclingEvent);
                _context.SaveChanges();
            }

            return RedirectToAction("FlaggedEvents");
        }

        [HttpPost]
        public IActionResult ApproveEvent(int eventId)
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
                recyclingEvent.IsFlagged = false; // Unflag the event (approve it)
                _context.SaveChanges();
                TempData["Success"] = "Event approved and unflagged successfully.";
            }

            return RedirectToAction("FlaggedEvents");
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

        // Material Management Actions
        [HttpPost]
        public IActionResult CreateMaterial(string name, int pointsPerUnit)
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

            var material = new Material
            {
                Name = name,
                PointsPerUnit = pointsPerUnit
            };

            _context.Materials.Add(material);
            _context.SaveChanges();
            TempData["Success"] = $"Material '{name}' added successfully!";

            return RedirectToAction("ManageMaterials");
        }

        [HttpPost]
        public IActionResult UpdateMaterial(int materialId, string name, int pointsPerUnit)
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

            var material = _context.Materials.Find(materialId);
            if (material != null)
            {
                material.Name = name;
                material.PointsPerUnit = pointsPerUnit;
                _context.SaveChanges();
                TempData["Success"] = $"Material '{name}' updated successfully!";
            }

            return RedirectToAction("ManageMaterials");
        }

        [HttpPost]
        public IActionResult DeleteMaterial(int materialId)
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

            var material = _context.Materials.Find(materialId);
            if (material != null)
            {
                var materialName = material.Name;
                _context.Materials.Remove(material);
                _context.SaveChanges();
                TempData["Success"] = $"Material '{materialName}' deleted successfully!";
            }

            return RedirectToAction("ManageMaterials");
        }

        // Event Management Actions
        public IActionResult ManageEvents()
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

            var events = _context.Events
                .Include(e => e.CreatedByUser)
                .OrderByDescending(e => e.CreatedAt)
                .ToList();

            return View(events);
        }

        public IActionResult AddEvent()
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

            return View();
        }

        [HttpPost]
        public IActionResult AddEvent(string title, string description, DateTime eventDate, string location)
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

            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(description) || string.IsNullOrWhiteSpace(location))
            {
                TempData["Error"] = "All fields are required.";
                return View();
            }

            if (eventDate < DateTime.Now)
            {
                TempData["Error"] = "Event date cannot be in the past.";
                return View();
            }

            var newEvent = new Event
            {
                Title = title,
                Description = description,
                EventDate = eventDate,
                Location = location,
                CreatedAt = DateTime.Now,
                CreatedByUserId = userId.Value,
                IsActive = true
            };

            _context.Events.Add(newEvent);
            _context.SaveChanges();

            TempData["Success"] = $"Event '{title}' added successfully!";
            return RedirectToAction("ManageEvents");
        }

        public IActionResult EditEvent(int id)
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

            var eventToEdit = _context.Events.Find(id);
            if (eventToEdit == null)
            {
                TempData["Error"] = "Event not found.";
                return RedirectToAction("ManageEvents");
            }

            return View(eventToEdit);
        }

        [HttpPost]
        public IActionResult EditEvent(int id, string title, string description, DateTime eventDate, string location, bool isActive)
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

            var eventToEdit = _context.Events.Find(id);
            if (eventToEdit == null)
            {
                TempData["Error"] = "Event not found.";
                return RedirectToAction("ManageEvents");
            }

            if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(description) || string.IsNullOrWhiteSpace(location))
            {
                TempData["Error"] = "All fields are required.";
                return View(eventToEdit);
            }

            eventToEdit.Title = title;
            eventToEdit.Description = description;
            eventToEdit.EventDate = eventDate;
            eventToEdit.Location = location;
            eventToEdit.IsActive = isActive;

            _context.SaveChanges();

            TempData["Success"] = $"Event '{title}' updated successfully!";
            return RedirectToAction("ManageEvents");
        }

        [HttpPost]
        public IActionResult DeleteEventById(int id)
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

            var eventToDelete = _context.Events.Find(id);
            if (eventToDelete != null)
            {
                var eventTitle = eventToDelete.Title;
                _context.Events.Remove(eventToDelete);
                _context.SaveChanges();
                TempData["Success"] = $"Event '{eventTitle}' deleted successfully!";
            }

            return RedirectToAction("ManageEvents");
        }
    }
}