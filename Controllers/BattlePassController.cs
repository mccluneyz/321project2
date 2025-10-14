using Microsoft.AspNetCore.Mvc;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class ClaimRewardRequest
    {
        public int TierId { get; set; }
    }

    public class PurchaseShopItemRequest
    {
        public int ItemId { get; set; }
    }

    public class EquipRewardRequest
    {
        public int RewardId { get; set; }
    }

    public class BattlePassController : Controller
    {
        private readonly ApplicationDbContext _context;

        public BattlePassController(ApplicationDbContext context)
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

            // Get battle pass tiers
            var battlePassTiers = _context.BattlePassTiers.OrderBy(t => t.TierNumber).ToList();
            
            // Debug logging
            System.Diagnostics.Debug.WriteLine($"BattlePass Index - Found {battlePassTiers.Count} tiers");
            foreach (var tier in battlePassTiers.Take(3))
            {
                System.Diagnostics.Debug.WriteLine($"Tier {tier.TierNumber}: ID={tier.Id}, Name={tier.RewardName}");
            }
            
            // Get user's unlocked rewards
            var userRewards = _context.UserRewards.Where(r => r.UserId == userId).ToList();
            
            // Get shop items
            var shopItems = _context.ShopItems.Where(i => i.IsAvailable).ToList();

            ViewBag.User = user;
            ViewBag.BattlePassTiers = battlePassTiers;
            ViewBag.UserRewards = userRewards;
            ViewBag.ShopItems = shopItems;

            return View();
        }

        [HttpPost]
        public IActionResult PurchaseShopItem([FromBody] PurchaseShopItemRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Please log in" });
            }

            var user = _context.Users.Find(userId);
            var shopItem = _context.ShopItems.Find(request.ItemId);

            // Debug logging
            System.Diagnostics.Debug.WriteLine($"PurchaseShopItem called - UserId: {userId}, ItemId: {request.ItemId}");
            System.Diagnostics.Debug.WriteLine($"User found: {user != null}, ShopItem found: {shopItem != null}");

            if (user == null)
            {
                return Json(new { success = false, message = "User not found" });
            }

            if (shopItem == null)
            {
                return Json(new { success = false, message = $"Shop item with ID {request.ItemId} not found" });
            }

            if (user.Points < shopItem.Cost)
            {
                return Json(new { success = false, message = "Not enough points" });
            }

            // Check if user already owns this item
            var existingReward = _context.UserRewards
                .FirstOrDefault(r => r.UserId == userId && r.RewardName == shopItem.Name);
            
            if (existingReward != null)
            {
                return Json(new { success = false, message = "You already own this item" });
            }

            // Deduct points
            user.Points -= shopItem.Cost;

            // Add reward to user
            var userReward = new UserReward
            {
                UserId = userId.Value,
                RewardType = shopItem.ItemType,
                RewardName = shopItem.Name,
                RewardValue = shopItem.ItemValue,
                UnlockedAt = DateTime.Now,
                IsEquipped = false
            };

            _context.UserRewards.Add(userReward);
            _context.SaveChanges();

            // Update session
            HttpContext.Session.SetInt32("UserPoints", user.Points);

            return Json(new { success = true, message = $"Purchased {shopItem.Name}!", newPoints = user.Points });
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
        public IActionResult ClaimReward([FromBody] ClaimRewardRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Please log in" });
            }

            var user = _context.Users.Find(userId);
            var tier = _context.BattlePassTiers.Find(request.TierId);

            // Debug logging
            System.Diagnostics.Debug.WriteLine($"ClaimReward called - UserId: {userId}, TierId: {request.TierId}");
            System.Diagnostics.Debug.WriteLine($"User found: {user != null}, Tier found: {tier != null}");

            if (user == null)
            {
                return Json(new { success = false, message = "User not found" });
            }

            if (tier == null)
            {
                return Json(new { success = false, message = $"Tier with ID {request.TierId} not found" });
            }

            if (user.Points < tier.RequiredPoints)
            {
                return Json(new { success = false, message = "Not enough points to claim this reward" });
            }

            // Check if user already owns this reward
            var existingReward = _context.UserRewards
                .FirstOrDefault(r => r.UserId == userId && r.RewardName == tier.RewardName);
            
            if (existingReward != null)
            {
                return Json(new { success = false, message = "You already own this reward" });
            }

            // Add reward to user
            var userReward = new UserReward
            {
                UserId = userId.Value,
                RewardType = tier.RewardType,
                RewardName = tier.RewardName,
                RewardValue = tier.RewardValue,
                UnlockedAt = DateTime.Now,
                IsEquipped = false
            };

            _context.UserRewards.Add(userReward);
            _context.SaveChanges();

            return Json(new { success = true, message = $"Claimed {tier.RewardName}!" });
        }
    }
}
