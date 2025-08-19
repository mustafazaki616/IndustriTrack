using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class StockOutModel
    {
        public int Id { get; set; }
        [Required]
        public string Product { get; set; }
        [Required]
        public int Quantity { get; set; }
        public string Buyer { get; set; }
        public DateTime Date { get; set; }
        public string Reason { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
    }
} 