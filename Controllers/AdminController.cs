using Microsoft.AspNetCore.Mvc;
using RecycleRank.Data;
using RecycleRank.Models;
using Microsoft.EntityFrameworkCore;

namespace RecycleRank.Controllers
{
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper method to check if current user is admin
        private bool IsAdmin()
        {
            var isAdmin = HttpContext.Session.GetString("IsAdmin");
            return isAdmin == "True";
        }

        // Helper method to redirect non-admin users
        private IActionResult CheckAdminAccess()
        {
            var isAdmin = HttpContext.Session.GetString("IsAdmin");
            var userId = HttpContext.Session.GetInt32("UserId");
            
            if (!IsAdmin())
            {
                TempData["Error"] = $"Access denied. Admin privileges required. UserId: {userId}, IsAdmin: {isAdmin}";
                return RedirectToAction("Index", "Home");
            }
            return null;
        }

        public IActionResult Index()
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            // Get dashboard statistics
            var totalUsers = _context.Users.Count();
            var totalBins = _context.Bins.Count();
            var totalMaterials = _context.Materials.Count();
            var totalRecyclingEvents = _context.RecyclingEvents.Count();
            var recentEvents = _context.RecyclingEvents
                .Include(re => re.User)
                .Include(re => re.Bin)
                .OrderByDescending(re => re.CreatedAt)
                .Take(10)
                .ToList();

            ViewBag.TotalUsers = totalUsers;
            ViewBag.TotalBins = totalBins;
            ViewBag.TotalMaterials = totalMaterials;
            ViewBag.TotalRecyclingEvents = totalRecyclingEvents;
            ViewBag.RecentEvents = recentEvents;

            return View();
        }

        public IActionResult ManageBins()
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var bins = _context.Bins.ToList();
            TempData["Debug"] = $"ManageBins called - Found {bins.Count} bins";
            return View(bins);
        }

        public IActionResult ManageMaterials()
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var materials = _context.Materials.ToList();
            TempData["Debug"] = $"ManageMaterials called - Found {materials.Count} materials";
            return View(materials);
        }

        public IActionResult ManageUsers()
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var users = _context.Users.ToList();
            var currentUserId = HttpContext.Session.GetInt32("UserId") ?? 0;
            
            ViewBag.CurrentUserId = currentUserId;
            return View(users);
        }

        public IActionResult FlaggedEvents()
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            // Get flagged events (events with IsFlagged = true)
            var flaggedEvents = _context.RecyclingEvents
                .Include(re => re.User)
                .Include(re => re.Bin)
                .Where(re => re.IsFlagged == true)
                .OrderByDescending(re => re.CreatedAt)
                .ToList();

            TempData["Debug"] = $"FlaggedEvents called - Found {flaggedEvents.Count} flagged events";
            return View(flaggedEvents);
        }

        public IActionResult AllRecyclingEvents()
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            // Get all recycling events
            var allEvents = _context.RecyclingEvents
                .Include(re => re.User)
                .Include(re => re.Bin)
                .OrderByDescending(re => re.CreatedAt)
                .ToList();

            var materials = _context.Materials.ToList();
            var flaggedEventIds = _context.RecyclingEvents
                .Where(re => re.IsFlagged == true)
                .Select(re => re.Id)
                .ToList();

            ViewBag.Events = allEvents;
            ViewBag.Materials = materials;
            ViewBag.FlaggedEventIds = flaggedEventIds;

            return View();
        }

        [HttpPost]
        public IActionResult FlagEvent(int eventId)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var recyclingEvent = _context.RecyclingEvents.Find(eventId);
            if (recyclingEvent != null)
            {
                recyclingEvent.IsFlagged = true;
                _context.SaveChanges();
                TempData["Success"] = $"Event #{eventId} has been flagged for review.";
            }
            else
            {
                TempData["Error"] = "Event not found.";
            }

            return RedirectToAction("AllRecyclingEvents");
        }

        [HttpPost]
        public IActionResult UnflagEvent(int eventId)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var recyclingEvent = _context.RecyclingEvents.Find(eventId);
            if (recyclingEvent != null)
            {
                recyclingEvent.IsFlagged = false;
                _context.SaveChanges();
                TempData["Success"] = $"Event #{eventId} flag has been removed.";
            }
            else
            {
                TempData["Error"] = "Event not found.";
            }

            return RedirectToAction("AllRecyclingEvents");
        }

        [HttpPost]
        public IActionResult ApproveEvent(int eventId)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var recyclingEvent = _context.RecyclingEvents.Find(eventId);
            if (recyclingEvent != null)
            {
                recyclingEvent.IsFlagged = false;
                _context.SaveChanges();
                TempData["Success"] = $"Event #{eventId} has been approved and unflagged.";
            }
            else
            {
                TempData["Error"] = "Event not found.";
            }

            return RedirectToAction("FlaggedEvents");
        }

        [HttpPost]
        public IActionResult RejectEvent(int eventId)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var recyclingEvent = _context.RecyclingEvents.Find(eventId);
            if (recyclingEvent != null)
            {
                _context.RecyclingEvents.Remove(recyclingEvent);
                _context.SaveChanges();
                TempData["Success"] = $"Event #{eventId} has been rejected and removed from the system.";
            }
            else
            {
                TempData["Error"] = "Event not found.";
            }

            return RedirectToAction("FlaggedEvents");
        }

        [HttpPost]
        public IActionResult CreateBin(string name, string address, double latitude, double longitude)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var bin = new Bin
            {
                Name = name,
                Address = address,
                Latitude = latitude,
                Longitude = longitude
            };

            _context.Bins.Add(bin);
            _context.SaveChanges();

            TempData["Success"] = $"Bin '{name}' created successfully!";
            return RedirectToAction("ManageBins");
        }

        [HttpPost]
        public IActionResult CreateMaterial(string name, int pointsPerUnit)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var material = new Material
            {
                Name = name,
                PointsPerUnit = pointsPerUnit
            };

            _context.Materials.Add(material);
            _context.SaveChanges();

            TempData["Success"] = $"Material '{name}' created successfully!";
            return RedirectToAction("ManageMaterials");
        }

        [HttpPost]
        public IActionResult ToggleAdminStatus(int userId)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var user = _context.Users.Find(userId);
            if (user != null)
            {
                user.IsAdmin = !user.IsAdmin;
                _context.SaveChanges();
                TempData["Success"] = $"Admin status updated for {user.Name}";
            }

            return RedirectToAction("ManageUsers");
        }

        // Bin CRUD Operations
        [HttpPost]
        public IActionResult UpdateBin(int binId, string name, string address, double latitude, double longitude)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var bin = _context.Bins.Find(binId);
            if (bin != null)
            {
                bin.Name = name;
                bin.Address = address;
                bin.Latitude = latitude;
                bin.Longitude = longitude;
                _context.SaveChanges();
                TempData["Success"] = $"Bin '{name}' updated successfully!";
            }
            else
            {
                TempData["Error"] = "Bin not found.";
            }

            return RedirectToAction("ManageBins");
        }

        [HttpPost]
        public IActionResult DeleteBin(int binId)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var bin = _context.Bins.Find(binId);
            if (bin != null)
            {
                _context.Bins.Remove(bin);
                _context.SaveChanges();
                TempData["Success"] = $"Bin '{bin.Name}' deleted successfully!";
            }
            else
            {
                TempData["Error"] = "Bin not found.";
            }

            return RedirectToAction("ManageBins");
        }

        // Material CRUD Operations
        [HttpPost]
        public IActionResult UpdateMaterial(int materialId, string name, int pointsPerUnit)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var material = _context.Materials.Find(materialId);
            if (material != null)
            {
                material.Name = name;
                material.PointsPerUnit = pointsPerUnit;
                _context.SaveChanges();
                TempData["Success"] = $"Material '{name}' updated successfully!";
            }
            else
            {
                TempData["Error"] = "Material not found.";
            }

            return RedirectToAction("ManageMaterials");
        }

        [HttpPost]
        public IActionResult DeleteMaterial(int materialId)
        {
            var adminCheck = CheckAdminAccess();
            if (adminCheck != null) return adminCheck;

            var material = _context.Materials.Find(materialId);
            if (material != null)
            {
                _context.Materials.Remove(material);
                _context.SaveChanges();
                TempData["Success"] = $"Material '{material.Name}' deleted successfully!";
            }
            else
            {
                TempData["Error"] = "Material not found.";
            }

            return RedirectToAction("ManageMaterials");
        }
    }
}
