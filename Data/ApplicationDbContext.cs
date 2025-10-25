using Microsoft.EntityFrameworkCore;
using RecycleRank.Models;

namespace RecycleRank.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<RecyclingEvent> RecyclingEvents { get; set; }
        public DbSet<Bin> Bins { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<Rank> Ranks { get; set; }
        public DbSet<BattlePassTier> BattlePassTiers { get; set; }
        public DbSet<ShopItem> ShopItems { get; set; }
        public DbSet<UserReward> UserRewards { get; set; }
        public DbSet<Event> Events { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<RecyclingEvent>()
                .HasOne(r => r.User)
                .WithMany(u => u.Events)
                .HasForeignKey(r => r.UserId);

            modelBuilder.Entity<RecyclingEvent>()
                .HasOne(r => r.Bin)
                .WithMany()
                .HasForeignKey(r => r.BinId);

            modelBuilder.Entity<UserReward>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId);
        }
    }
}
