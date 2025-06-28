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
    public class InspectionsController : ControllerBase
    {
        private readonly IndustriTrackContext _context;

        public InspectionsController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InspectionModel>>> GetInspections()
        {
            return await _context.Inspections.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InspectionModel>> GetInspection(int id)
        {
            var inspection = await _context.Inspections.FindAsync(id);
            if (inspection == null)
            {
                return NotFound();
            }
            return inspection;
        }

        [HttpPost]
        public async Task<ActionResult<InspectionModel>> CreateInspection([FromBody] InspectionModel inspection)
        {
            inspection.CreatedAt = DateTime.UtcNow;
            _context.Inspections.Add(inspection);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetInspection), new { id = inspection.Id }, inspection);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInspection(int id, [FromBody] InspectionModel inspection)
        {
            if (id != inspection.Id)
            {
                return BadRequest();
            }

            var existingInspection = await _context.Inspections.FindAsync(id);
            if (existingInspection == null)
            {
                return NotFound();
            }

            existingInspection.OrderId = inspection.OrderId;
            existingInspection.Status = inspection.Status;
            existingInspection.Inspector = inspection.Inspector;
            existingInspection.InspectionDate = inspection.InspectionDate;
            existingInspection.Result = inspection.Result;
            existingInspection.Notes = inspection.Notes;
            existingInspection.IsPassed = inspection.IsPassed;
            existingInspection.Defects = inspection.Defects;
            existingInspection.DefectCount = inspection.DefectCount;
            existingInspection.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!InspectionExists(id))
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
        public async Task<IActionResult> DeleteInspection(int id)
        {
            var inspection = await _context.Inspections.FindAsync(id);
            if (inspection == null)
            {
                return NotFound();
            }

            _context.Inspections.Remove(inspection);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool InspectionExists(int id)
        {
            return _context.Inspections.Any(e => e.Id == id);
        }
    }
} 