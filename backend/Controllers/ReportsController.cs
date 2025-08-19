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
    public class ReportsController : ControllerBase
    {
        private readonly IndustriTrackContext _context;

        public ReportsController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReportModel>>> GetReports()
        {
            return await _context.Reports.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ReportModel>> GetReport(int id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
            {
                return NotFound();
            }
            return report;
        }

        [HttpPost]
        public async Task<ActionResult<ReportModel>> CreateReport([FromBody] ReportModel report)
        {
            report.CreatedAt = DateTime.UtcNow;
            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetReport), new { id = report.Id }, report);
        }

        [HttpPost("generate/{productionId}")]
        public async Task<IActionResult> GenerateReport(int productionId)
        {
            var production = await _context.Productions.FindAsync(productionId);
            if (production == null)
                return NotFound("Production not found");
            var order = await _context.Orders.FindAsync(production.OrderId);
            if (order == null)
                return NotFound("Order not found");

            // Fetch stages from ProductionStageModel
            var stages = await _context.ProductionStages
                .Where(s => s.OrderId == production.OrderId)
                .OrderBy(s => s.StageNumber)
                .ToListAsync();

            // Compose report data
            var reportData = new {
                Order = order,
                Production = production,
                Stages = stages
            };
            var report = new ReportModel
            {
                Title = $"Production Report for Order #{order.Id}",
                Type = "Production",
                Data = System.Text.Json.JsonSerializer.Serialize(reportData),
                Description = $"Auto-generated report for Order #{order.Id} ({order.Article})",
                IsGenerated = true,
                GeneratedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };
            _context.Reports.Add(report);
            await _context.SaveChangesAsync();
            return Ok(report);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReport(int id, [FromBody] ReportModel report)
        {
            if (id != report.Id)
            {
                return BadRequest();
            }

            var existingReport = await _context.Reports.FindAsync(id);
            if (existingReport == null)
            {
                return NotFound();
            }

            existingReport.Title = report.Title;
            existingReport.Type = report.Type;
            existingReport.Data = report.Data;
            existingReport.DownloadUrl = report.DownloadUrl;
            existingReport.Description = report.Description;
            existingReport.IsGenerated = report.IsGenerated;
            existingReport.GeneratedBy = report.GeneratedBy;
            existingReport.GeneratedAt = report.GeneratedAt;
            existingReport.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ReportExists(id))
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
        public async Task<IActionResult> DeleteReport(int id)
        {
            var report = await _context.Reports.FindAsync(id);
            if (report == null)
            {
                return NotFound();
            }

            _context.Reports.Remove(report);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ReportExists(int id)
        {
            return _context.Reports.Any(e => e.Id == id);
        }
    }
} 