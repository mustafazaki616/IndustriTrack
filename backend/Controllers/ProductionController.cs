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
    public class ProductionController : ControllerBase
    {
        private readonly IndustriTrackContext _context;

        public ProductionController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductionModel>>> GetProductions()
        {
            return await _context.Productions.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductionModel>> GetProduction(int id)
        {
            var production = await _context.Productions.FindAsync(id);
            if (production == null)
            {
                return NotFound();
            }
            return production;
        }

        [HttpPost]
        public async Task<ActionResult<ProductionModel>> CreateProduction([FromBody] ProductionModel production)
        {
            production.CreatedAt = DateTime.UtcNow;
            _context.Productions.Add(production);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduction), new { id = production.Id }, production);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduction(int id, [FromBody] ProductionModel production)
        {
            if (id != production.Id)
            {
                return BadRequest();
            }

            var existingProduction = await _context.Productions.FindAsync(id);
            if (existingProduction == null)
            {
                return NotFound();
            }

            existingProduction.OrderId = production.OrderId;
            existingProduction.Status = production.Status;
            existingProduction.Stage = production.Stage;
            existingProduction.StartDate = production.StartDate;
            existingProduction.CompletionDate = production.CompletionDate;
            existingProduction.ExpectedDuration = production.ExpectedDuration;
            existingProduction.ActualDuration = production.ActualDuration;
            existingProduction.Notes = production.Notes;
            existingProduction.AssignedWorker = production.AssignedWorker;
            existingProduction.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductionExists(id))
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
        public async Task<IActionResult> DeleteProduction(int id)
        {
            var production = await _context.Productions.FindAsync(id);
            if (production == null)
            {
                return NotFound();
            }

            _context.Productions.Remove(production);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductionExists(int id)
        {
            return _context.Productions.Any(e => e.Id == id);
        }
    }
} 