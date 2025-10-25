namespace RecycleRank.Models
{
    public class GameSession
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime LastPlayedAt { get; set; }
        public int PlaysToday { get; set; }
        public int TotalGamesPlayed { get; set; }
        public int HighScore { get; set; }
        public int MaxDistance { get; set; } // Furthest distance traveled in meters
        public int TotalPointsEarned { get; set; }
        
        public User User { get; set; } = null!;
    }
}

