namespace RecycleRank.Models
{
    public class RecyclingEvent
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BinId { get; set; }
        public string Material { get; set; } = "";
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public User? User { get; set; }
        public Bin? Bin { get; set; }
    }
}
