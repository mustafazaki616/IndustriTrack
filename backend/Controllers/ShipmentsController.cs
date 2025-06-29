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
    public class ShipmentsController : ControllerBase
    {
        private readonly IndustriTrackContext _context;

        public ShipmentsController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetShipments()
        {
            var shipments = await _context.Shipments
                .Join(_context.Orders,
                    shipment => shipment.OrderId,
                    order => order.Id,
                    (shipment, order) => new
                    {
                        shipment.Id,
                        shipment.OrderId,
                        shipment.Status,
                        shipment.TrackingNumber,
                        shipment.ShippingAddress,
                        shipment.Carrier,
                        shipment.ShippingCost,
                        shipment.EstimatedDelivery,
                        shipment.ActualDelivery,
                        shipment.CreatedAt,
                        shipment.UpdatedAt,
                        Customer = order.Customer,
                        Article = order.Article,
                        Sizes = order.Sizes,
                        TotalUnits = order.TotalQuantity
                    })
                .ToListAsync();

            return shipments;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ShipmentModel>> GetShipment(int id)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound();
            }
            return shipment;
        }

        [HttpPost]
        public async Task<ActionResult<ShipmentModel>> CreateShipment([FromBody] ShipmentModel shipment)
        {
            shipment.CreatedAt = DateTime.UtcNow;
            _context.Shipments.Add(shipment);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetShipment), new { id = shipment.Id }, shipment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateShipment(int id, [FromBody] ShipmentModel shipment)
        {
            if (id != shipment.Id)
            {
                return BadRequest();
            }

            var existingShipment = await _context.Shipments.FindAsync(id);
            if (existingShipment == null)
            {
                return NotFound();
            }

            existingShipment.OrderId = shipment.OrderId;
            existingShipment.Status = shipment.Status;
            existingShipment.TrackingNumber = shipment.TrackingNumber;
            existingShipment.ShippingAddress = shipment.ShippingAddress;
            existingShipment.Carrier = shipment.Carrier;
            existingShipment.ShippingCost = shipment.ShippingCost;
            existingShipment.EstimatedDelivery = shipment.EstimatedDelivery;
            existingShipment.ActualDelivery = shipment.ActualDelivery;
            existingShipment.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ShipmentExists(id))
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
        public async Task<IActionResult> DeleteShipment(int id)
        {
            var shipment = await _context.Shipments.FindAsync(id);
            if (shipment == null)
            {
                return NotFound();
            }

            _context.Shipments.Remove(shipment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ShipmentExists(int id)
        {
            return _context.Shipments.Any(e => e.Id == id);
        }
    }
} 