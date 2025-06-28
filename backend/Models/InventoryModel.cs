using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class InventoryModel
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public required string ItemName { get; set; }
        
        [MaxLength(100)]
        public string? Category { get; set; }
        
        [MaxLength(100)]
        public string? Location { get; set; }
        
        public int Quantity { get; set; }
        
        [MaxLength(50)]
        public string? Unit { get; set; }
        
        public int? MinStock { get; set; }
        
        public int? MaxStock { get; set; }
        
        [MaxLength(200)]
        public string? Supplier { get; set; }
        
        public decimal? Cost { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public string? Notes { get; set; }
    }
} 