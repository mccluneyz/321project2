namespace RecycleRank.Models
{
    public class Rank
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public int MinPoints { get; set; }
        public int MaxPoints { get; set; }
        public string Color { get; set; } = "";
    }
}
