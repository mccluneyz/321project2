namespace RecycleRank.Models
{
    public enum RankLevel { Bronze, Silver, Gold, Platinum, Diamond }

    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = "";
        public string Name { get; set; } = "";
        public string Password { get; set; } = "";
        public string ProfilePicture { get; set; } = "";
        public int Points { get; set; } = 0;
        public RankLevel Rank { get; set; } = RankLevel.Bronze;
        public bool IsAdmin { get; set; } = false;
        public ICollection<RecyclingEvent> Events { get; set; } = new List<RecyclingEvent>();
    }
}
