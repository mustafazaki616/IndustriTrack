using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class ProductionStageModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(100)]
        public string StageName { get; set; } = string.Empty;

        [Required]
        public int StageNumber { get; set; }

        public DateTime? StartDate { get; set; }

        [Required]
        public int ExpectedDuration { get; set; } // in days

        public int? ActualDuration { get; set; } // in days

        public DateTime? CompletionDate { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, In Progress, Completed, Overdue

        [MaxLength(100)]
        public string? WorkerName { get; set; }

        public string? Notes { get; set; }
    }
} 