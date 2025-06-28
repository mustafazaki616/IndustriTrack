using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace backend.Models
{
    public class OrderModel
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public required string Customer { get; set; }
        
        [Required]
        [MaxLength(200)]
        public required string Article { get; set; }
        
        public Dictionary<string, int> Sizes { get; set; } = new Dictionary<string, int>();
        
        public int TotalQuantity { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public string? Status { get; set; } = "Pending";
        
        public decimal? Price { get; set; }
        
        public string? Notes { get; set; }
    }
} 