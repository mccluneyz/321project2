using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecycleRank.Data;
using RecycleRank.Models;
using RecycleRank.Services;

namespace RecycleRank.Controllers
{
    public class SubmitScoreRequest
    {
        public int Score { get; set; }
        public int Distance { get; set; }
        public int TimeTaken { get; set; }
    }

    public class SaveGameScoreRequest
    {
        public int Score { get; set; }
        public string Grade { get; set; } = "";
        public int EnemiesKilled { get; set; }
        public int DamageDealt { get; set; }
        public int DamageTaken { get; set; }
        public int Deaths { get; set; }
        public int PlayTime { get; set; } // in seconds
    }

    public class GameController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly PointsService _pointsService;
        private const int MAX_DAILY_PLAYS = 5;
        private const int COOLDOWN_HOURS = 2;

        public GameController(ApplicationDbContext context, PointsService pointsService)
        {
            _context = context;
            _pointsService = pointsService;
        }

        // Recycling Hero - New Phaser Game
        public async Task<IActionResult> Hero()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return RedirectToAction("Login", "Account");
            }

            // Get or create game session
            var gameSession = await _context.GameSessions
                .FirstOrDefaultAsync(gs => gs.UserId == userId);

            if (gameSession == null)
            {
                gameSession = new GameSession
                {
                    UserId = userId.Value,
                    LastPlayedAt = DateTime.MinValue,
                    PlaysToday = 0,
                    TotalGamesPlayed = 0,
                    HighScore = 0,
                    MaxDistance = 0,
                    TotalPointsEarned = 0
                };
                _context.GameSessions.Add(gameSession);
                await _context.SaveChangesAsync();
            }

            // Reset daily plays if it's a new day
            if (gameSession.LastPlayedAt.Date != DateTime.Today)
            {
                gameSession.PlaysToday = 0;
            }

            // Check cooldown
            var timeSinceLastPlay = DateTime.Now - gameSession.LastPlayedAt;
            bool cooldownExpired = timeSinceLastPlay.TotalHours >= COOLDOWN_HOURS;

            // Check if user can play (admin bypass or cooldown expired and under daily limit)
            var canPlay = user.IsAdmin || (cooldownExpired && gameSession.PlaysToday < MAX_DAILY_PLAYS);

            ViewBag.CanPlay = canPlay;
            ViewBag.IsAdmin = user.IsAdmin;
            ViewBag.PlaysLeft = MAX_DAILY_PLAYS - gameSession.PlaysToday;
            ViewBag.CooldownMinutes = cooldownExpired ? 0 : COOLDOWN_HOURS * 60 - (int)timeSinceLastPlay.TotalMinutes;

            return View();
        }

        // Redirect old route to new game
        public IActionResult Index()
        {
            return RedirectToAction("Hero");
        }

        [HttpPost]
        public async Task<IActionResult> SubmitScore([FromBody] SubmitScoreRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Please log in" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Json(new { success = false, message = "User not found" });
            }

            var gameSession = await _context.GameSessions
                .FirstOrDefaultAsync(gs => gs.UserId == userId);

            if (gameSession == null)
            {
                return Json(new { success = false, message = "Game session not found" });
            }

            // Reset daily plays if it's a new day
            if (gameSession.LastPlayedAt.Date < DateTime.Now.Date)
            {
                gameSession.PlaysToday = 0;
            }

            // Check if user can play (admins bypass limit)
            if (!user.IsAdmin && gameSession.PlaysToday >= MAX_DAILY_PLAYS)
            {
                return Json(new { success = false, message = "Daily play limit reached. Come back tomorrow!" });
            }

            // Calculate points based on score and time
            // Better score = more points, faster time = bonus points
            var basePoints = request.Score * 10; // 10 points per match
            var timeBonus = Math.Max(0, 300 - request.TimeTaken); // Bonus for fast completion (up to 5 min)
            var totalPoints = basePoints + (timeBonus / 10);

            // Award points through service (applies rank multiplier)
            await _pointsService.AwardPointsAsync(userId.Value, totalPoints);

            // Update game session
            gameSession.LastPlayedAt = DateTime.Now;
            gameSession.PlaysToday++;
            gameSession.TotalGamesPlayed++;
            gameSession.TotalPointsEarned += totalPoints;
            
            bool newHighScore = false;
            if (request.Score > gameSession.HighScore)
            {
                gameSession.HighScore = request.Score;
                newHighScore = true;
            }

            // Track max distance
            if (request.Distance > gameSession.MaxDistance)
            {
                gameSession.MaxDistance = request.Distance;
            }

            await _context.SaveChangesAsync();

            // Reload user to get updated points
            await _context.Entry(user).ReloadAsync();
            var playsRemaining = user.IsAdmin ? 999 : (MAX_DAILY_PLAYS - gameSession.PlaysToday);

            return Json(new
            {
                success = true,
                message = $"Great job! You earned {totalPoints} points!",
                pointsEarned = totalPoints,
                playsRemaining = playsRemaining,
                newTotalPoints = user.Points,
                newHighScore = newHighScore,
                isAdmin = user.IsAdmin
            });
        }

        [HttpPost]
        public async Task<IActionResult> SaveGameScore([FromBody] SaveGameScoreRequest request)
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return Json(new { success = false, message = "Please log in" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return Json(new { success = false, message = "User not found" });
            }

            var gameSession = await _context.GameSessions
                .FirstOrDefaultAsync(gs => gs.UserId == userId);

            if (gameSession == null)
            {
                gameSession = new GameSession
                {
                    UserId = userId.Value,
                    LastPlayedAt = DateTime.Now,
                    PlaysToday = 0,
                    TotalGamesPlayed = 0,
                    HighScore = 0,
                    MaxDistance = 0,
                    TotalPointsEarned = 0
                };
                _context.GameSessions.Add(gameSession);
            }

            // Award coins based on score (score = coins, max 120)
            var coinsEarned = request.Score;
            await _pointsService.AwardPointsAsync(userId.Value, coinsEarned);

            // Update game session stats
            gameSession.LastPlayedAt = DateTime.Now;
            gameSession.TotalGamesPlayed++;
            gameSession.TotalPointsEarned += coinsEarned;
            
            // Update high score if new best
            bool newHighScore = false;
            if (request.Score > gameSession.HighScore)
            {
                gameSession.HighScore = request.Score;
                newHighScore = true;
            }

            await _context.SaveChangesAsync();

            // Reload user to get updated points
            await _context.Entry(user).ReloadAsync();

            return Json(new
            {
                success = true,
                message = $"Victory! You earned {coinsEarned} coins!",
                coinsEarned = coinsEarned,
                newTotalCoins = user.Points,
                newHighScore = newHighScore,
                grade = request.Grade
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetLeaderboard()
        {
            try
            {
                var leaderboard = await _context.GameSessions
                    .Include(gs => gs.User)
                    .Where(gs => gs.HighScore > 0)
                    .OrderByDescending(gs => gs.HighScore)
                    .Take(10)
                    .Select(gs => new
                    {
                        username = gs.User.Name,
                        score = gs.HighScore,
                        gamesPlayed = gs.TotalGamesPlayed
                    })
                    .ToListAsync();

                return Json(new
                {
                    success = true,
                    leaderboard = leaderboard
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}


