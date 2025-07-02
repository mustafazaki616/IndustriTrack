using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class PaymentModel
    {
        public int Id { get; set; }
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending"; // Pending, Completed, Partial, Unpaid
        
        [MaxLength(50)]
        public string? Method { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        public DateTime? PaymentDate { get; set; }
        
        public string? Customer { get; set; }
        
        public string? TransactionId { get; set; }
        
        public string? Notes { get; set; }
        
        public bool IsPaid { get; set; }

        // Added fields for frontend sync
        [MaxLength(10)]
        public string Currency { get; set; } = "USD";
        public bool AdvanceReceived { get; set; }
        public DateTime? AdvanceDueDate { get; set; }
        public decimal RemainingAmount { get; set; }
        public DateTime? FullPaymentDueDate { get; set; }

        // Calculated fields (not mapped to DB)
        public int AdvanceDueDaysLeft { get; set; }
        public int DaysUntilFullPayment { get; set; }
        [NotMapped]
        public bool isOverdue { get; set; }
    }
} 