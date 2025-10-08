namespace RecycleRank.Models
{
    public class Bin
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Address { get; set; }
    }
}
