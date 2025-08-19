using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

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

            // Auto-generate report and update payment status if inspection is completed
            if (inspection.Status == "Completed")
            {
                var order = await _context.Orders.FindAsync(existingInspection.OrderId);
                if (order != null)
                {
                    // Create report if not exists
                    var existingReport = await _context.Reports.FirstOrDefaultAsync(r => r.Title == $"Inspection Report for Order #{order.Id}" && r.Type == "Inspection");
                    if (existingReport == null)
                    {
                        var report = new ReportModel
                        {
                            Title = $"Inspection Report for Order #{order.Id}",
                            Type = "Inspection",
                            CreatedAt = DateTime.UtcNow,
                            Description = inspection.Notes,
                            Data = JsonSerializer.Serialize(new {
                                OrderId = order.Id,
                                Customer = order.Customer,
                                Article = order.Article,
                                InspectionResult = inspection.Result,
                                Inspector = inspection.Inspector,
                                Notes = inspection.Notes,
                                IsPassed = inspection.IsPassed,
                                Defects = inspection.Defects,
                                DefectCount = inspection.DefectCount
                            }),
                            IsGenerated = true,
                            GeneratedBy = inspection.Inspector,
                            GeneratedAt = DateTime.UtcNow
                        };
                        _context.Reports.Add(report);
                    }
                    // Update payment status
                    var payment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == order.Id);
                    if (payment != null)
                    {
                        payment.Status = "Ready for Payment";
                        payment.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

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

        [HttpPost("start/{orderId}")]
        public async Task<IActionResult> StartInspection(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound("Order not found");
            // Check if already in inspection
            var existing = await _context.Inspections.FirstOrDefaultAsync(i => i.OrderId == orderId);
            if (existing != null)
                return BadRequest("Inspection already started for this order");
            var inspection = new InspectionModel
            {
                OrderId = orderId,
                Status = "In Progress",
                CreatedAt = DateTime.UtcNow
            };
            _context.Inspections.Add(inspection);
            order.Status = "Inspection";
            await _context.SaveChangesAsync();
            return Ok(inspection);
        }

        private bool InspectionExists(int id)
        {
            return _context.Inspections.Any(e => e.Id == id);
        }
    }
} 