namespace RecycleRank.Models
{
    public class BattlePassTier
    {
        public int Id { get; set; }
        public int TierNumber { get; set; }
        public int RequiredPoints { get; set; }
        public string RewardType { get; set; } = ""; // "avatar", "banner", "title", "badge"
        public string RewardName { get; set; } = "";
        public string RewardDescription { get; set; } = "";
        public string RewardValue { get; set; } = ""; // URL, emoji, or text
        public bool IsFree { get; set; } = true;
        public string Icon { get; set; } = "";
    }

    public class ShopItem
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public int Cost { get; set; }
        public string ItemType { get; set; } = ""; // "avatar", "banner", "title", "badge"
        public string ItemValue { get; set; } = ""; // URL, emoji, or text
        public string Icon { get; set; } = "";
        public bool IsAvailable { get; set; } = true;
    }

    public class UserReward
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string RewardType { get; set; } = "";
        public string RewardName { get; set; } = "";
        public string RewardValue { get; set; } = "";
        public DateTime UnlockedAt { get; set; } = DateTime.Now;
        public bool IsEquipped { get; set; } = false;

        public User? User { get; set; }
    }
}
