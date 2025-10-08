using Microsoft.AspNetCore.Mvc;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            // TODO: Add admin dashboard logic
            return View();
        }

        public IActionResult ManageBins()
        {
            var bins = _context.Bins.ToList();
            return View(bins);
        }

        public IActionResult ManageMaterials()
        {
            var materials = _context.Materials.ToList();
            return View(materials);
        }

        public IActionResult FlaggedEvents()
        {
            // TODO: Implement flagged events logic
            return View();
        }

        [HttpPost]
        public IActionResult CreateBin(Bin bin)
        {
            // TODO: Implement bin creation logic
            return RedirectToAction("ManageBins");
        }

        [HttpPost]
        public IActionResult CreateMaterial(Material material)
        {
            // TODO: Implement material creation logic
            return RedirectToAction("ManageMaterials");
        }
    }
}
