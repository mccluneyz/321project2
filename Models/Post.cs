using System.ComponentModel.DataAnnotations;

namespace RecycleRank.Models
{
    public class Post
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Content { get; set; } = "";
        
        public string? ImagePath { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
