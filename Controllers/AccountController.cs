using Microsoft.AspNetCore.Mvc;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Login(string email, string password)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                ViewBag.Error = "Please enter both email and password.";
                return View();
            }

            // Find user by email
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null || user.Password != password)
            {
                ViewBag.Error = "Invalid email or password.";
                return View();
            }

            // Set session variables
            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("UserName", user.Name);
            HttpContext.Session.SetString("UserEmail", user.Email);
            HttpContext.Session.SetInt32("UserPoints", user.Points);
            HttpContext.Session.SetString("UserRank", user.Rank.ToString());
            HttpContext.Session.SetString("IsAdmin", user.IsAdmin.ToString());

            return RedirectToAction("Index", "Home");
        }

        public IActionResult Register()
        {
            return RedirectToAction("Login");
        }

        [HttpPost]
        public IActionResult Register(IFormCollection form)
        {
            try
            {
                var email = form["email"].ToString();
                var password = form["password"].ToString();
                var firstName = form["firstName"].ToString();
                var lastName = form["lastName"].ToString();

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password) || 
                    string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName))
                {
                    ViewBag.Error = "Please fill in all fields.";
                    ViewBag.ShowSignUp = true;
                    return View("Login");
                }

                // Check if user already exists
                if (_context.Users.Any(u => u.Email == email))
                {
                    ViewBag.Error = "An account with this email already exists.";
                    ViewBag.ShowSignUp = true;
                    return View("Login");
                }

                // Create new user
                var fullName = $"{firstName} {lastName}";
                var newUser = new User
                {
                    Email = email,
                    Password = password,
                    Name = fullName,
                    Points = 0,
                    Rank = RankLevel.Bronze,
                    IsAdmin = false
                };

                _context.Users.Add(newUser);
                _context.SaveChanges();

                // Automatically log in the user after registration
                HttpContext.Session.SetInt32("UserId", newUser.Id);
                HttpContext.Session.SetString("UserName", newUser.Name);
                HttpContext.Session.SetString("UserEmail", newUser.Email);
                HttpContext.Session.SetInt32("UserPoints", newUser.Points);
                HttpContext.Session.SetString("UserRank", newUser.Rank.ToString());
                HttpContext.Session.SetString("IsAdmin", newUser.IsAdmin.ToString());

                // Redirect to home page
                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                ViewBag.Error = $"Registration failed: {ex.Message}";
                ViewBag.ShowSignUp = true;
                return View("Login");
            }
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Home");
        }
    }
}
