using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace Backend.Models;
public class Investment
{
    public int InvestmentId { get; set; }
    
    [Precision(18, 8)]
    public decimal Quantity { get; set; }
    
    [Precision(15, 2)]
    public decimal PurchasePrice { get; set; }
    
    [Precision(15, 2)]
    public decimal? CurrentPrice { get; set; }
    
    public DateTime PurchaseDate { get; set; }
    
    public TransactionAction Action { get; set; }
    
    // Foreign Keys
    public int UserId { get; set; }
    public string AssetName { get; set; }
    
    // Navigation Properties
    public User User { get; set; }
}
public enum TransactionAction
{
    Buy,
    Sell
}