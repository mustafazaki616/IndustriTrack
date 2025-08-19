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

        // GET: api/production
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetProductions()
        {
            // Run overdue logic automatically
            var today = DateTime.UtcNow.Date;
            var overdueStages = await _context.ProductionStages
                .Where(s => s.Status != "Completed" && s.StartDate != null && (
                    (s.ExpectedDuration == 0) ||
                    (s.ExpectedDuration > 0 && today > s.StartDate.Value.AddDays(s.ExpectedDuration))
                ))
                .ToListAsync();
            foreach (var s in overdueStages)
            {
                if (s.Status != "Overdue")
                {
                    s.Status = "Overdue";
                }
            }
            if (overdueStages.Count > 0)
            {
                await _context.SaveChangesAsync();
            }
            var productions = await _context.Productions.ToListAsync();
            var orderIds = productions.Select(p => p.OrderId).Distinct().ToList();
            var orders = await _context.Orders.Where(o => orderIds.Contains(o.Id)).ToDictionaryAsync(o => o.Id);
            var result = new List<object>();
            foreach (var p in productions)
            {
                var stages = await _context.ProductionStages.Where(s => s.OrderId == p.OrderId).OrderBy(s => s.StageNumber).ToListAsync();
                result.Add(new {
                    p.Id,
                    p.OrderId,
                    p.Status,
                    p.Stage,
                    p.CreatedAt,
                    p.UpdatedAt,
                    p.StartDate,
                    p.CompletionDate,
                    p.ExpectedDuration,
                    p.ActualDuration,
                    p.Notes,
                    p.AssignedWorker,
                    Stages = stages,
                    Customer = orders.ContainsKey(p.OrderId) ? orders[p.OrderId].Customer : null
                });
            }
            return Ok(result);
        }

        // GET: api/production/{id}
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

        // POST: api/production
        [HttpPost]
        public async Task<ActionResult<ProductionModel>> CreateProduction([FromBody] ProductionModel production)
        {
            production.CreatedAt = DateTime.UtcNow;
            _context.Productions.Add(production);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProduction), new { id = production.Id }, production);
        }

        // PUT: api/production/{id}
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

            // Auto-move to inspection if production is completed
            if (production.Status == "Completed")
            {
                var order = await _context.Orders.FindAsync(existingProduction.OrderId);
                if (order != null && order.Status != "Inspection")
                {
                    // Check if inspection already exists
                    var existingInspection = await _context.Inspections.FirstOrDefaultAsync(i => i.OrderId == order.Id);
                    if (existingInspection == null)
                    {
                        var inspection = new InspectionModel
                        {
                            OrderId = order.Id,
                            Status = "In Progress",
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.Inspections.Add(inspection);
                    }
                    order.Status = "Inspection";
                }
                // Create shipment if not already exists
                var existingShipment = await _context.Shipments.FirstOrDefaultAsync(s => s.OrderId == existingProduction.OrderId);
                if (existingShipment == null)
                {
                    var shipment = new ShipmentModel
                    {
                        OrderId = existingProduction.OrderId,
                        Status = "Pending",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Shipments.Add(shipment);
                }
            }

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

        // DELETE: api/production/{id}
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

        // DTOs for starting production
        public class StartProductionDto
        {
            public List<ProductionStageDto>? Stages { get; set; }
        }
        public class ProductionStageDto
        {
            public string Name { get; set; } = string.Empty;
            public int ExpectedDays { get; set; }
        }

        // POST: api/production/start/{orderId}
        [HttpPost("start/{orderId}")]
        public async Task<IActionResult> StartProduction(int orderId, [FromBody] StartProductionDto body)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
                return NotFound("Order not found");

            // Check if already in production
            var existingProduction = await _context.Productions.FirstOrDefaultAsync(p => p.OrderId == orderId);
            if (existingProduction == null)
            {
                // Create production record if not exists
                existingProduction = new ProductionModel
                {
                    OrderId = orderId,
                    Status = "In Progress",
                    Stage = "TRIMS IN HOUSE",
                    CreatedAt = DateTime.UtcNow,
                    StartDate = DateTime.UtcNow
                };
                _context.Productions.Add(existingProduction);
                order.Status = "In Production";
                await _context.SaveChangesAsync();
            }

            // Check if stages already exist
            var existingStages = await _context.ProductionStages.Where(s => s.OrderId == orderId).ToListAsync();
            if (existingStages.Count < 8) // If missing or incomplete, (re)create all 8 stages
            {
                // Remove any partial/old stages
                if (existingStages.Count > 0)
                {
                    _context.ProductionStages.RemoveRange(existingStages);
                    await _context.SaveChangesAsync();
                }
                // Use custom stages if provided, else default
                List<ProductionStageModel> stages = null;
                if (body != null && body.Stages != null && body.Stages.Count == 8)
                {
                    int stageNum = 1;
                    stages = body.Stages.Select(s => new ProductionStageModel {
                        OrderId = orderId,
                        StageName = s.Name,
                        StageNumber = stageNum++,
                        ExpectedDuration = s.ExpectedDays,
                        Status = stageNum == 2 ? "In Progress" : "Pending"
                    }).ToList();
                    stages[0].Status = "In Progress";
                    stages[0].StartDate = DateTime.UtcNow;
                }
                else
                {
                    // Default stages
                    stages = new List<ProductionStageModel> {
                        new ProductionStageModel { OrderId = orderId, StageName = "TRIMS IN HOUSE", StageNumber = 1, ExpectedDuration = 1, Status = "In Progress", StartDate = DateTime.UtcNow },
                        new ProductionStageModel { OrderId = orderId, StageName = "FABRIC ETA", StageNumber = 2, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = orderId, StageName = "CUTTING", StageNumber = 3, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = orderId, StageName = "STITCHING", StageNumber = 4, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = orderId, StageName = "FINISHING", StageNumber = 5, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = orderId, StageName = "PACKING", StageNumber = 6, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = orderId, StageName = "OFFLINE", StageNumber = 7, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = orderId, StageName = "INSPECTION", StageNumber = 8, ExpectedDuration = 1, Status = "Pending" }
                    };
                }
                _context.ProductionStages.AddRange(stages);
                await _context.SaveChangesAsync();
            }
            // Always return the 8 stages for this order
            var allStages = await _context.ProductionStages.Where(s => s.OrderId == orderId).OrderBy(s => s.StageNumber).ToListAsync();
            return Ok(new { Production = existingProduction, Stages = allStages });
        }

        // GET: api/production/stages/{orderId}
        [HttpGet("stages/{orderId}")]
        public async Task<ActionResult<IEnumerable<ProductionStageModel>>> GetProductionStagesForOrder(int orderId)
        {
            var stages = await _context.ProductionStages
                .Where(s => s.OrderId == orderId)
                .OrderBy(s => s.StageNumber)
                .ToListAsync();
            return Ok(stages);
        }

        // POST: api/orders/production/updateStage
        public class UpdateStageDto
        {
            public int StageId { get; set; }
            public string Status { get; set; } = string.Empty;
            public string? WorkerName { get; set; }
            public string? Notes { get; set; }
            public DateTime? CompletionDate { get; set; }
            public int? ActualDuration { get; set; }
            public int? ExpectedDuration { get; set; } // Added for extending stages
        }

        [HttpPost("/api/orders/production/updateStage")]
        public async Task<IActionResult> UpdateProductionStage([FromBody] UpdateStageDto dto)
        {
            var stage = await _context.ProductionStages.FindAsync(dto.StageId);
            if (stage == null)
                return NotFound("Stage not found.");
            // If extending (Status is 'In Progress' and ActualDuration is not set), update ExpectedDuration and reset status
            if (dto.Status == "In Progress" && dto.ActualDuration == null && dto.CompletionDate == null)
            {
                // Add the provided ExpectedDuration (delta) to the current ExpectedDuration
                if (dto.ExpectedDuration.HasValue && dto.ExpectedDuration.Value > 0)
                {
                    stage.ExpectedDuration += dto.ExpectedDuration.Value;
                }
                stage.Status = "In Progress";
                await _context.SaveChangesAsync();
                return Ok(stage);
            }
            stage.Status = dto.Status;
            if (!string.IsNullOrEmpty(dto.WorkerName))
                stage.WorkerName = dto.WorkerName;
            if (!string.IsNullOrEmpty(dto.Notes))
                stage.Notes = dto.Notes;
            if (dto.CompletionDate.HasValue)
                stage.CompletionDate = dto.CompletionDate;
            if (dto.ActualDuration.HasValue)
                stage.ActualDuration = dto.ActualDuration;

            // If marking as completed, set completion date, actual duration, and auto-start next stage
            if (dto.Status == "Completed")
            {
                if (!stage.CompletionDate.HasValue)
                    stage.CompletionDate = DateTime.UtcNow;
                if (!stage.ActualDuration.HasValue && stage.StartDate.HasValue)
                    stage.ActualDuration = (int)(stage.CompletionDate.Value.Date - stage.StartDate.Value.Date).TotalDays;

                // Find next stage
                var nextStage = await _context.ProductionStages
                    .Where(s => s.OrderId == stage.OrderId && s.StageNumber == stage.StageNumber + 1)
                    .FirstOrDefaultAsync();
                if (nextStage != null && nextStage.Status == "Pending")
                {
                    nextStage.Status = "In Progress";
                    nextStage.StartDate = DateTime.UtcNow;
                }
                else if (nextStage == null)
                {
                    // Last stage completed: update Production and Order status
                    var production = await _context.Productions.FirstOrDefaultAsync(p => p.OrderId == stage.OrderId);
                    if (production != null)
                    {
                        production.Status = "Completed";
                        production.Stage = stage.StageName;
                        production.CompletionDate = DateTime.UtcNow;
                        if (production.StartDate.HasValue)
                        {
                            production.ActualDuration = (int)(production.CompletionDate.Value.Date - production.StartDate.Value.Date).TotalDays;
                        }
                    }
                    var order = await _context.Orders.FindAsync(stage.OrderId);
                    if (order != null)
                    {
                        order.Status = "Ready for Inspection";
                    }
                }
            }
            await _context.SaveChangesAsync();
            return Ok(stage);
        }

        // GET: api/orders/overdueStages
        [HttpGet("/api/orders/overdueStages")]
        public async Task<ActionResult<IEnumerable<ProductionStageModel>>> GetOverdueStages()
        {
            var today = DateTime.UtcNow.Date;
            var overdueStages = await _context.ProductionStages
                .Where(s => s.Status != "Completed" && s.StartDate != null && today >= s.StartDate.Value.AddDays(s.ExpectedDuration))
                .OrderBy(s => s.OrderId).ThenBy(s => s.StageNumber)
                .ToListAsync();
            // Mark as overdue if not already
            foreach (var s in overdueStages)
            {
                if (s.Status != "Overdue")
                {
                    s.Status = "Overdue";
                }
            }
            await _context.SaveChangesAsync();
            return Ok(overdueStages);
        }

        // POST: api/production/fix-missing-stages
        [HttpPost("fix-missing-stages")]
        public async Task<IActionResult> FixMissingStages()
        {
            var inProductionOrders = await _context.Orders.Where(o => o.Status == "In Production").ToListAsync();
            int fixedCount = 0;
            foreach (var order in inProductionOrders)
            {
                var existingStages = await _context.ProductionStages.Where(s => s.OrderId == order.Id).ToListAsync();
                if (existingStages.Count < 8)
                {
                    if (existingStages.Count > 0)
                    {
                        _context.ProductionStages.RemoveRange(existingStages);
                        await _context.SaveChangesAsync();
                    }
                    var stages = new List<ProductionStageModel> {
                        new ProductionStageModel { OrderId = order.Id, StageName = "TRIMS IN HOUSE", StageNumber = 1, ExpectedDuration = 1, Status = "In Progress", StartDate = DateTime.UtcNow },
                        new ProductionStageModel { OrderId = order.Id, StageName = "FABRIC ETA", StageNumber = 2, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = order.Id, StageName = "CUTTING", StageNumber = 3, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = order.Id, StageName = "STITCHING", StageNumber = 4, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = order.Id, StageName = "FINISHING", StageNumber = 5, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = order.Id, StageName = "PACKING", StageNumber = 6, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = order.Id, StageName = "OFFLINE", StageNumber = 7, ExpectedDuration = 1, Status = "Pending" },
                        new ProductionStageModel { OrderId = order.Id, StageName = "INSPECTION", StageNumber = 8, ExpectedDuration = 1, Status = "Pending" }
                    };
                    _context.ProductionStages.AddRange(stages);
                    await _context.SaveChangesAsync();
                    fixedCount++;
                }
            }
            return Ok(new { message = $"Fixed {fixedCount} orders with missing stages." });
        }

        private bool ProductionExists(int id)
        {
            return _context.Productions.Any(e => e.Id == id);
        }

        // AUTOMATION: Ensure stages are created when order status is set to 'In Production'
        // This should be called after any update to an order's status
        public async Task EnsureProductionStagesForOrder(int orderId)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null || order.Status != "In Production") return;
            var existingStages = await _context.ProductionStages.Where(s => s.OrderId == orderId).ToListAsync();
            if (existingStages.Count < 8)
            {
                if (existingStages.Count > 0)
                {
                    _context.ProductionStages.RemoveRange(existingStages);
                    await _context.SaveChangesAsync();
                }
                var stages = new List<ProductionStageModel> {
                    new ProductionStageModel { OrderId = orderId, StageName = "TRIMS IN HOUSE", StageNumber = 1, ExpectedDuration = 1, Status = "In Progress", StartDate = DateTime.UtcNow },
                    new ProductionStageModel { OrderId = orderId, StageName = "FABRIC ETA", StageNumber = 2, ExpectedDuration = 1, Status = "Pending" },
                    new ProductionStageModel { OrderId = orderId, StageName = "CUTTING", StageNumber = 3, ExpectedDuration = 1, Status = "Pending" },
                    new ProductionStageModel { OrderId = orderId, StageName = "STITCHING", StageNumber = 4, ExpectedDuration = 1, Status = "Pending" },
                    new ProductionStageModel { OrderId = orderId, StageName = "FINISHING", StageNumber = 5, ExpectedDuration = 1, Status = "Pending" },
                    new ProductionStageModel { OrderId = orderId, StageName = "PACKING", StageNumber = 6, ExpectedDuration = 1, Status = "Pending" },
                    new ProductionStageModel { OrderId = orderId, StageName = "OFFLINE", StageNumber = 7, ExpectedDuration = 1, Status = "Pending" },
                    new ProductionStageModel { OrderId = orderId, StageName = "INSPECTION", StageNumber = 8, ExpectedDuration = 1, Status = "Pending" }
                };
                _context.ProductionStages.AddRange(stages);
                await _context.SaveChangesAsync();
            }
        }
    }
} 