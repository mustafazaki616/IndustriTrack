using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ShipmentModel
    {
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string Status { get; set; }
        
        [MaxLength(100)]
        public string? TrackingNumber { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public string? ShippingAddress { get; set; }
        
        public string? Carrier { get; set; }
        
        public decimal? ShippingCost { get; set; }
        
        public DateTime? EstimatedDelivery { get; set; }
        
        public DateTime? ActualDelivery { get; set; }
    }
} 