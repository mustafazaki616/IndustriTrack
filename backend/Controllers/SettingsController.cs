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
    public class SettingsController : ControllerBase
    {
        private readonly IndustriTrackContext _context;

        public SettingsController(IndustriTrackContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SettingModel>>> GetSettings()
        {
            return await _context.Settings.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SettingModel>> GetSetting(int id)
        {
            var setting = await _context.Settings.FindAsync(id);
            if (setting == null)
            {
                return NotFound();
            }
            return setting;
        }

        [HttpPost]
        public async Task<ActionResult<SettingModel>> CreateSetting([FromBody] SettingModel setting)
        {
            setting.CreatedAt = DateTime.UtcNow;
            _context.Settings.Add(setting);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSetting), new { id = setting.Id }, setting);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSetting(int id, [FromBody] SettingModel setting)
        {
            if (id != setting.Id)
            {
                return BadRequest();
            }

            var existingSetting = await _context.Settings.FindAsync(id);
            if (existingSetting == null)
            {
                return NotFound();
            }

            existingSetting.Key = setting.Key;
            existingSetting.Value = setting.Value;
            existingSetting.Description = setting.Description;
            existingSetting.Category = setting.Category;
            existingSetting.IsActive = setting.IsActive;
            existingSetting.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SettingExists(id))
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
        public async Task<IActionResult> DeleteSetting(int id)
        {
            var setting = await _context.Settings.FindAsync(id);
            if (setting == null)
            {
                return NotFound();
            }

            _context.Settings.Remove(setting);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool SettingExists(int id)
        {
            return _context.Settings.Any(e => e.Id == id);
        }
    }
} 