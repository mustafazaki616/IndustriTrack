using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using UglyToad.PdfPig;
using System.Linq;
using System.Net.Http;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IndustriTrackContext _context;

        public OrdersController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderModel>>> GetOrders()
        {
            return await _context.Orders.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrderModel>> GetOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            return order;
        }

        [HttpPost]
        public async Task<ActionResult<OrderModel>> CreateOrder([FromBody] OrderModel order)
        {
            order.CreatedAt = DateTime.UtcNow;
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderModel order)
        {
            if (id != order.Id)
            {
                return BadRequest();
            }

            var existingOrder = await _context.Orders.FindAsync(id);
            if (existingOrder == null)
            {
                return NotFound();
            }

            existingOrder.Customer = order.Customer;
            existingOrder.Article = order.Article;
            existingOrder.Sizes = order.Sizes;
            existingOrder.TotalQuantity = order.TotalQuantity;
            existingOrder.Status = order.Status;
            existingOrder.Price = order.Price;
            existingOrder.Notes = order.Notes;
            existingOrder.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(int id)
        {
            return _context.Orders.Any(e => e.Id == id);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadOrderFile()
        {
            // Create a sample order and save to database
            var order = new OrderModel
            {
                Customer = "Auto Customer",
                Article = "Auto Article",
                Sizes = new Dictionary<string, int> { { "XS", 10 }, { "S", 20 }, { "M", 30 }, { "L", 25 }, { "XL", 15 } },
                TotalQuantity = 100,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        [HttpPost("upload-pdf")]
        public async Task<IActionResult> UploadPdf()
        {
            var file = Request.Form.Files.FirstOrDefault();
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            string allText = "";
            using (var stream = file.OpenReadStream())
            using (var pdf = PdfDocument.Open(stream))
            {
                allText = string.Join("\n", pdf.GetPages().Select(p => p.Text));
            }
            var orders = new List<object>();
            var orderBlocks = allText.Split(new[] { "Order ID:" }, System.StringSplitOptions.RemoveEmptyEntries);
            foreach (var block in orderBlocks)
            {
                var lines = ("Order ID:" + block).Split('\n').Select(l => l.Trim()).Where(l => l.Length > 0).ToList();
                string orderId = null, clientName = null, deliveryDate = null, notes = null;
                List<Dictionary<string, string>> items = new List<Dictionary<string, string>>();
                int i = 0;
                while (i < lines.Count)
                {
                    if (lines[i].StartsWith("Order ID:")) orderId = lines[i].Substring("Order ID:".Length).Trim();
                    else if (lines[i].StartsWith("Client Name:")) clientName = lines[i].Substring("Client Name:".Length).Trim();
                    else if (lines[i].StartsWith("Delivery Date:")) deliveryDate = lines[i].Substring("Delivery Date:".Length).Trim();
                    else if (lines[i].StartsWith("Additional Notes:")) { notes = lines[i].Substring("Additional Notes:".Length).Trim(); break; }
                    i++;
                }
                // Find the product table header (e.g., 'Product Name Size Quantity Color Fabric Type')
                int headerIdx = lines.FindIndex(l => l.ToLower().Replace(" ","").Contains("productnamesizequantitycolorfabrictype"));
                if (headerIdx >= 0)
                {
                    // Extract rows after header until 'Additional Notes:' or end
                    int notesIdx = lines.FindIndex(headerIdx, l => l.StartsWith("Additional Notes:"));
                    int tableEnd = notesIdx > 0 ? notesIdx : lines.Count;
                    for (int j = headerIdx + 1; j < tableEnd; j++)
                    {
                        var row = lines[j];
                        if (string.IsNullOrWhiteSpace(row)) continue;
                        // Try splitting by two or more spaces, or by tab, or by single space if all else fails
                        var cols = row.Split(new[] { "  ", "\t" }, System.StringSplitOptions.RemoveEmptyEntries);
                        if (cols.Length < 5) cols = row.Split(new[] { ' ' }, System.StringSplitOptions.RemoveEmptyEntries);
                        if (cols.Length >= 5)
                        {
                            items.Add(new Dictionary<string, string>
                            {
                                ["productName"] = cols[0],
                                ["size"] = cols[1],
                                ["quantity"] = cols[2],
                                ["color"] = cols[3],
                                ["fabricType"] = cols[4]
                            });
                        }
                    }
                }
                if (!string.IsNullOrEmpty(orderId))
                {
                    orders.Add(new {
                        orderId,
                        clientName,
                        deliveryDate,
                        notes,
                        items
                    });
                }
            }
            return Ok(new { orders, rawText = allText });
        }

        [HttpPost("extract-python")]
        public async Task<IActionResult> ExtractWithPython()
        {
            var file = Request.Form.Files.FirstOrDefault();
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var ext = Path.GetExtension(file.FileName).ToLower();
            var pythonUrl = ext == ".pdf"
                ? "http://localhost:8001/extract/pdf"
                : "http://localhost:8001/extract/excel";

            using var client = new HttpClient();
            using var content = new MultipartFormDataContent();
            using var stream = file.OpenReadStream();
            content.Add(new StreamContent(stream), "file", file.FileName);

            var response = await client.PostAsync(pythonUrl, content);
            var result = await response.Content.ReadAsStringAsync();
            return Content(result, "application/json");
        }
    }
} 