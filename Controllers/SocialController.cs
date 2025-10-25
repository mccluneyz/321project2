using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecycleRank.Data;
using RecycleRank.Models;

namespace RecycleRank.Controllers
{
    public class SocialController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SocialController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var posts = await _context.Posts
                .Include(p => p.User)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return View(posts);
        }

        [HttpGet]
        public IActionResult Create()
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(string Content, IFormFile? imageFile)
        {
            Console.WriteLine($"Create POST method called. Content: '{Content}'");
            
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login", "Account");
            }

            if (string.IsNullOrWhiteSpace(Content))
            {
                Console.WriteLine("Content is empty or null");
                ModelState.AddModelError("Content", "Content is required.");
                return View();
            }

            var post = new Post
            {
                Content = Content,
                UserId = userId.Value,
                CreatedAt = DateTime.Now
            };

            // Handle image upload
            if (imageFile != null && imageFile.Length > 0)
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "posts");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(stream);
                }

                post.ImagePath = $"/uploads/posts/{fileName}";
                Console.WriteLine($"Image uploaded: {post.ImagePath}");
            }
            
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"Post created successfully with ID: {post.Id}");

            return RedirectToAction("Index");
        }

        [HttpGet]
        public async Task<IActionResult> Delete(int id)
        {
            Console.WriteLine($"Delete GET method called for ID: {id}");
            
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                Console.WriteLine("User not logged in");
                return RedirectToAction("Login", "Account");
            }

            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                Console.WriteLine($"Post with ID {id} not found");
                return NotFound();
            }
            
            if (post.UserId != userId.Value)
            {
                Console.WriteLine($"User {userId.Value} trying to delete post owned by {post.UserId}");
                return NotFound();
            }

            Console.WriteLine($"Deleting post: {post.Content}");

            // Delete the image file if it exists
            if (!string.IsNullOrEmpty(post.ImagePath))
            {
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", post.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                    Console.WriteLine($"Deleted image file: {imagePath}");
                }
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"Post {id} deleted successfully");

            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeletePost(int id)
        {
            Console.WriteLine($"Delete POST method called for ID: {id}");
            
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                Console.WriteLine("User not logged in");
                return RedirectToAction("Login", "Account");
            }

            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                Console.WriteLine($"Post with ID {id} not found");
                return NotFound();
            }
            
            if (post.UserId != userId.Value)
            {
                Console.WriteLine($"User {userId.Value} trying to delete post owned by {post.UserId}");
                return NotFound();
            }

            Console.WriteLine($"Deleting post: {post.Content}");

            // Delete the image file if it exists
            if (!string.IsNullOrEmpty(post.ImagePath))
            {
                var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", post.ImagePath.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                    Console.WriteLine($"Deleted image file: {imagePath}");
                }
            }

            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            
            Console.WriteLine($"Post {id} deleted successfully");

            return RedirectToAction("Index");
        }
    }
}
