using Microsoft.AspNetCore.Mvc;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class RecyclingController : Controller
    {
        private readonly ApplicationDbContext _context;

        public RecyclingController(ApplicationDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            var bins = _context.Bins.ToList();
            var materials = _context.Materials.ToList();
            
            ViewBag.Bins = bins;
            ViewBag.Materials = materials;
            
            return View();
        }

        [HttpPost]
        public IActionResult LogRecycling(RecyclingEvent recyclingEvent)
        {
            // TODO: Implement recycling logging logic
            if (ModelState.IsValid)
            {
                _context.RecyclingEvents.Add(recyclingEvent);
                _context.SaveChanges();
                return RedirectToAction("Index");
            }
            
            return View("Index", recyclingEvent);
        }

        public IActionResult History()
        {
            // TODO: Implement user recycling history
            return View();
        }

        public IActionResult Map()
        {
            var bins = _context.Bins.ToList();
            return View(bins);
        }
    }
}
