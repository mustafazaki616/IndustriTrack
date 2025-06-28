using Microsoft.AspNetCore.Mvc;
using backend.Models;
using System.Collections.Generic;
using System.Linq;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private static List<CustomerModel> Customers = new List<CustomerModel>
        {
            new CustomerModel { Id = 1, Name = "Acme Corp", Email = "acme@example.com", Phone = "1234567890", Address = "123 Main St" },
            new CustomerModel { Id = 2, Name = "Beta Textiles", Email = "beta@example.com", Phone = "9876543210", Address = "456 Market Ave" }
        };

        [HttpGet]
        public ActionResult<IEnumerable<CustomerModel>> GetCustomers() => Ok(Customers);

        [HttpPost]
        public ActionResult<CustomerModel> AddCustomer([FromBody] CustomerModel customer)
        {
            customer.Id = Customers.Count > 0 ? Customers.Max(c => c.Id) + 1 : 1;
            Customers.Add(customer);
            return Ok(customer);
        }

        [HttpPut("{id}")]
        public IActionResult EditCustomer(int id, [FromBody] CustomerModel customer)
        {
            var idx = Customers.FindIndex(c => c.Id == id);
            if (idx < 0) return NotFound();
            customer.Id = id;
            Customers[idx] = customer;
            return Ok(customer);
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteCustomer(int id)
        {
            var idx = Customers.FindIndex(c => c.Id == id);
            if (idx < 0) return NotFound();
            Customers.RemoveAt(idx);
            return NoContent();
        }
    }
} 