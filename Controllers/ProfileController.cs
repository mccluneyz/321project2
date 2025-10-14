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

            // Get user's unlocked rewards
            var userRewards = _context.UserRewards
                .Where(r => r.UserId == userId)
                .OrderBy(r => r.RewardType)
                .ThenBy(r => r.RewardName)
                .ToList();

            // Get equipped items
            var equippedAvatar = userRewards.FirstOrDefault(r => r.RewardType == "avatar" && r.IsEquipped);
            var equippedBanner = userRewards.FirstOrDefault(r => r.RewardType == "banner" && r.IsEquipped);
            var equippedTitle = userRewards.FirstOrDefault(r => r.RewardType == "title" && r.IsEquipped);

            ViewBag.User = user;
            ViewBag.UserRewards = userRewards;
            ViewBag.EquippedAvatar = equippedAvatar;
            ViewBag.EquippedBanner = equippedBanner;
            ViewBag.EquippedTitle = equippedTitle;
            ViewBag.GetBannerStyle = new Func<string, string>(GetBannerStyle);
            ViewBag.GetRankStyle = new Func<RankLevel, RankStyle>(GetRankStyle);

            return View(user);
        }

        private string GetBannerStyle(string bannerValue)
        {
            return bannerValue switch
            {
                "🌲🌲🌲" => "background: linear-gradient(135deg, #2d5016 0%, #4a7c59 50%, #6b8e23 100%);",
                "🌊🌊🌊" => "background: linear-gradient(135deg, #0066cc 0%, #0099ff 50%, #66ccff 100%);",
                "🏔️🏔️🏔️" => "background: linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #cd853f 100%);",
                "🏜️🏜️🏜️" => "background: linear-gradient(135deg, #d2691e 0%, #f4a460 50%, #deb887 100%);",
                "❄️❄️❄️" => "background: linear-gradient(135deg, #b0e0e6 0%, #e0ffff 50%, #f0f8ff 100%);",
                "🌌🌌🌌" => "background: linear-gradient(135deg, #191970 0%, #4b0082 50%, #8a2be2 100%);",
                "🌈🌈🌈" => "background: linear-gradient(135deg, #ff0000 0%, #ff8000 16%, #ffff00 33%, #00ff00 50%, #0080ff 66%, #8000ff 83%, #ff0080 100%);",
                "🌅🌅🌅" => "background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffd700 100%);",
                _ => "background: linear-gradient(135deg, #28a745 0%, #007bff 100%);"
            };
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

        [HttpPost]
        public IActionResult EquipReward([FromBody] EquipRewardRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Please log in" });
            }

            var reward = _context.UserRewards.FirstOrDefault(r => r.Id == request.RewardId && r.UserId == userId);
            if (reward == null)
            {
                return Json(new { success = false, message = "Reward not found" });
            }

            // Unequip other items of the same type
            var sameTypeRewards = _context.UserRewards
                .Where(r => r.UserId == userId && r.RewardType == reward.RewardType)
                .ToList();
            
            foreach (var r in sameTypeRewards)
            {
                r.IsEquipped = false;
            }

            // Equip the selected reward
            reward.IsEquipped = true;
            _context.SaveChanges();

            return Json(new { success = true, message = $"Equipped {reward.RewardName}!" });
        }

        [HttpPost]
        public IActionResult UnequipReward([FromBody] EquipRewardRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Please log in" });
            }

            var reward = _context.UserRewards.FirstOrDefault(r => r.Id == request.RewardId && r.UserId == userId);
            if (reward == null)
            {
                return Json(new { success = false, message = "Reward not found" });
            }

            // Unequip the reward
            reward.IsEquipped = false;
            _context.SaveChanges();

            return Json(new { success = true, message = $"Unequipped {reward.RewardName}!" });
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

