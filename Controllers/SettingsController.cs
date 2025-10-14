using Microsoft.AspNetCore.Mvc;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class SettingsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
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

            ViewBag.User = user;
            return View();
        }

        [HttpPost]
        public IActionResult UpdateSettings(string name, string email, string currentPassword, string newPassword)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Please log in" });
            }

            var user = _context.Users.Find(userId);
            if (user == null)
            {
                return Json(new { success = false, message = "User not found" });
            }

            // Update name if provided
            if (!string.IsNullOrEmpty(name))
            {
                user.Name = name;
            }

            // Update email if provided
            if (!string.IsNullOrEmpty(email))
            {
                user.Email = email;
            }

            // Update password if provided
            if (!string.IsNullOrEmpty(newPassword))
            {
                if (string.IsNullOrEmpty(currentPassword) || user.Password != currentPassword)
                {
                    return Json(new { success = false, message = "Current password is incorrect" });
                }
                user.Password = newPassword;
            }

            _context.SaveChanges();

            return Json(new { success = true, message = "Settings updated successfully!" });
        }

        public IActionResult ManageBins()
        {
            var bins = _context.Bins.ToList();
            return View(bins);
        }

        public IActionResult ManageMaterials()
        {
            var materials = _context.Materials.ToList();
            return View(materials);
        }

        public IActionResult FlaggedEvents()
        {
            // TODO: Implement flagged events logic
            return View();
        }

        [HttpPost]
        public IActionResult CreateBin(Bin bin)
        {
            // TODO: Implement bin creation logic
            return RedirectToAction("ManageBins");
        }

        [HttpPost]
        public IActionResult CreateMaterial(Material material)
        {
            // TODO: Implement material creation logic
            return RedirectToAction("ManageMaterials");
        }
    }
}
