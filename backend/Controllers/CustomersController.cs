using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly IndustriTrackContext _context;
        public CustomersController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerModel>>> GetCustomers()
        {
            return Ok(await _context.Customers.ToListAsync());
        }

        [HttpPost]
        public async Task<ActionResult<CustomerModel>> AddCustomer([FromBody] CustomerModel customer)
        {
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return Ok(customer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditCustomer(int id, [FromBody] CustomerModel customer)
        {
            var existing = await _context.Customers.FindAsync(id);
            if (existing == null) return NotFound();
            customer.Id = id;
            _context.Entry(existing).CurrentValues.SetValues(customer);
            await _context.SaveChangesAsync();
            return Ok(customer);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var existing = await _context.Customers.FindAsync(id);
            if (existing == null) return NotFound();
            _context.Customers.Remove(existing);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 