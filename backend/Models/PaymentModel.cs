using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class PaymentModel
    {
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string Status { get; set; }
        
        [MaxLength(50)]
        public string? Method { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public decimal Amount { get; set; }
        
        public DateTime? PaymentDate { get; set; }
        
        public string? Customer { get; set; }
        
        public string? TransactionId { get; set; }
        
        public string? Notes { get; set; }
        
        public bool IsPaid { get; set; }
    }
} 