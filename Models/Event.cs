namespace RecycleRank.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime EventDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedByUserId { get; set; }
        public string Location { get; set; } = "";
        public bool IsActive { get; set; } = true;
        
        // Navigation property
        public User? CreatedByUser { get; set; }
    }
}
