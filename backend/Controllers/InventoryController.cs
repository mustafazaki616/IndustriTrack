using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
using System.Collections.Generic;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IndustriTrackContext _context;

        public InventoryController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryModel>>> GetInventory()
        {
            return await _context.Inventory.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryModel>> GetInventoryItem(int id)
        {
            var item = await _context.Inventory.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<InventoryModel>> AddInventory([FromBody] InventoryModel item)
        {
            item.CreatedAt = DateTime.UtcNow;
            _context.Inventory.Add(item);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetInventoryItem), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditInventory(int id, [FromBody] InventoryModel item)
        {
            if (id != item.Id)
            {
                return BadRequest();
            }

            var existingItem = await _context.Inventory.FindAsync(id);
            if (existingItem == null)
            {
                return NotFound();
            }

            existingItem.ItemName = item.ItemName;
            existingItem.Category = item.Category;
            existingItem.Location = item.Location;
            existingItem.Quantity = item.Quantity;
            existingItem.Unit = item.Unit;
            existingItem.MinStock = item.MinStock;
            existingItem.MaxStock = item.MaxStock;
            existingItem.Supplier = item.Supplier;
            existingItem.Cost = item.Cost;
            existingItem.Notes = item.Notes;
            existingItem.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InventoryItemExists(id))
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
        public async Task<IActionResult> DeleteInventory(int id)
        {
            var item = await _context.Inventory.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _context.Inventory.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InventoryItemExists(int id)
        {
            return _context.Inventory.Any(e => e.Id == id);
        }
    }
} 