using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class SettingModel
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public required string Key { get; set; }
        
        [MaxLength(1000)]
        public string? Value { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public string? Category { get; set; }
    }
} 