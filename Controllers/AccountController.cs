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
            // TODO: Implement authentication logic
            return RedirectToAction("Index", "Home");
        }

        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Register(string email, string password, string name)
        {
            // TODO: Implement registration logic
            return RedirectToAction("Login");
        }

        public IActionResult Logout()
        {
            // TODO: Implement logout logic
            return RedirectToAction("Index", "Home");
        }
    }
}
