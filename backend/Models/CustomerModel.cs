using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class CustomerModel
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public required string Name { get; set; }
        
        [EmailAddress]
        [MaxLength(200)]
        public string? Email { get; set; }
        
        [MaxLength(50)]
        public string? Phone { get; set; }
        
        [MaxLength(500)]
        public string? Address { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public string? Company { get; set; }
        
        public string? ContactPerson { get; set; }
    }
} 