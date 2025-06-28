using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ProductionStage
    {
        public required string Name { get; set; }
        public int ExpectedDays { get; set; }
        public int? ActualDays { get; set; }
        public required string Status { get; set; } // done, in-progress, pending
    }

    public class ProductionModel
    {
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string Status { get; set; }
        
        [Required]
        [MaxLength(100)]
        public required string Stage { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? CompletionDate { get; set; }
        
        public int? ExpectedDuration { get; set; }
        
        public int? ActualDuration { get; set; }
        
        public string? Notes { get; set; }
        
        public string? AssignedWorker { get; set; }
    }
} 