using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ReportModel
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public required string Title { get; set; }
        
        [Required]
        [MaxLength(100)]
        public required string Type { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public string? Data { get; set; } // JSON data for the report
        
        public string? DownloadUrl { get; set; }
        
        public string? Description { get; set; }
        
        public bool IsGenerated { get; set; }
        
        public string? GeneratedBy { get; set; }
        
        public DateTime? GeneratedAt { get; set; }
    }
} 