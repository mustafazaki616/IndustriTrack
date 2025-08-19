using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StockOutController : ControllerBase
    {
        private readonly IndustriTrackContext _context;
        public StockOutController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StockOutModel>>> GetStockOuts()
        {
            return await _context.StockOuts.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<StockOutModel>> AddStockOut([FromBody] StockOutModel stockOut)
        {
            _context.StockOuts.Add(stockOut);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetStockOuts), new { id = stockOut.Id }, stockOut);
        }
    }
} 