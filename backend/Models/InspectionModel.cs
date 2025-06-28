using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class InspectionModel
    {
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string Status { get; set; }
        
        [MaxLength(100)]
        public string? Inspector { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public DateTime? InspectionDate { get; set; }
        
        public string? Result { get; set; } // OK or Rejected
        
        public string? Notes { get; set; }
        
        public bool IsPassed { get; set; }
        
        public string? Defects { get; set; }
        
        public int? DefectCount { get; set; }
    }
} 