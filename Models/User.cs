namespace RecycleRank.Models
{
    public enum RankLevel { Plastic, Glass, Paper, Metal, Organic }

    public class User
    {
        public int Id { get; set; }
        public string Email { get; set; } = "";
        public string Name { get; set; } = "";
        public string Password { get; set; } = "";
        public string ProfilePicture { get; set; } = "";
        public int Points { get; set; } = 0;
        public int TotalPointsEarned { get; set; } = 0;
        public RankLevel Rank { get; set; } = RankLevel.Plastic;
        public bool IsAdmin { get; set; } = false;
        public ICollection<RecyclingEvent> Events { get; set; } = new List<RecyclingEvent>();
    }
}
