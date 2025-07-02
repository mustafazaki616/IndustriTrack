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
    public class PaymentsController : ControllerBase
    {
        private readonly IndustriTrackContext _context;

        public PaymentsController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentModel>>> GetPayments()
        {
            var today = DateTime.UtcNow.Date;
            var payments = await _context.Payments.ToListAsync();
            foreach (var payment in payments)
            {
                // Reverse counter for DaysUntilFullPayment
                var daysPassed = (today - payment.CreatedAt.Date).Days;
                payment.DaysUntilFullPayment = payment.DaysUntilFullPayment - daysPassed;
                // Status logic
                if (payment.RemainingAmount == 0 && payment.AdvanceReceived)
                    payment.Status = "Completed";
                else if (payment.AdvanceReceived && payment.RemainingAmount > 0)
                    payment.Status = "Partial";
                else if (!payment.AdvanceReceived && payment.AdvanceDueDaysLeft < 0)
                    payment.Status = "Unpaid";
                else
                    payment.Status = "Pending";
            }
            return payments;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentModel>> GetPayment(int id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return NotFound();
            }
            var today = DateTime.UtcNow.Date;
            var daysPassed = (today - payment.CreatedAt.Date).Days;
            payment.DaysUntilFullPayment = payment.DaysUntilFullPayment - daysPassed;
            // Status logic
            if (payment.RemainingAmount == 0 && payment.AdvanceReceived)
                payment.Status = "Completed";
            else if (payment.AdvanceReceived && payment.RemainingAmount > 0)
                payment.Status = "Partial";
            else if (!payment.AdvanceReceived && payment.AdvanceDueDaysLeft < 0)
                payment.Status = "Unpaid";
            else
                payment.Status = "Pending";
            return payment;
        }

        [HttpPost]
        public async Task<ActionResult<PaymentModel>> CreatePayment([FromBody] PaymentModel payment)
        {
            if (string.IsNullOrWhiteSpace(payment.CustomerName) || payment.Amount <= 0)
                return BadRequest("Customer name and positive amount are required.");
            payment.RemainingAmount = payment.Amount;
            if (!payment.AdvanceDueDate.HasValue)
                payment.AdvanceDueDate = DateTime.UtcNow.AddDays(7);
            if (!payment.FullPaymentDueDate.HasValue && payment.AdvanceReceived)
                payment.FullPaymentDueDate = payment.AdvanceDueDate.Value.AddDays(7);
            // Status logic
            if (payment.RemainingAmount == 0 && payment.AdvanceReceived)
                payment.Status = "Completed";
            else if (payment.AdvanceReceived && payment.RemainingAmount > 0)
                payment.Status = "Partial";
            else if (!payment.AdvanceReceived && payment.AdvanceDueDate.Value.Date < DateTime.UtcNow.Date)
                payment.Status = "Unpaid";
            else
                payment.Status = "Pending";
            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] PaymentModel payment)
        {
            var existing = await _context.Payments.FirstOrDefaultAsync(p => p.Id == id);
            if (existing == null) return NotFound();
            existing.CustomerName = payment.CustomerName;
            existing.Amount = payment.Amount;
            existing.AdvanceReceived = payment.AdvanceReceived;
            existing.AdvanceDueDate = payment.AdvanceDueDate;
            existing.RemainingAmount = payment.RemainingAmount;
            existing.FullPaymentDueDate = payment.FullPaymentDueDate;
            // Status logic
            if (existing.RemainingAmount == 0 && existing.AdvanceReceived)
                existing.Status = "Completed";
            else if (existing.AdvanceReceived && existing.RemainingAmount > 0)
                existing.Status = "Partial";
            else if (!existing.AdvanceReceived && existing.AdvanceDueDate.HasValue && existing.AdvanceDueDate.Value.Date < DateTime.UtcNow.Date)
                existing.Status = "Unpaid";
            else
                existing.Status = "Pending";
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePayment(int id)
        {
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.Id == id);
            if (payment == null) return NotFound(new { message = "Payment not found." });
            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Payment deleted." });
        }

        private bool PaymentExists(int id)
        {
            return _context.Payments.Any(e => e.Id == id);
        }
    }
} 