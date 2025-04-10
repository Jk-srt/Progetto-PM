using System.ComponentModel.DataAnnotations;
using Backend.Models;
using Microsoft.EntityFrameworkCore;


namespace Backend.Models;

public class Transaction
{
    public int TransactionId { get; set; }
    
    [Precision(15, 2)]
    public decimal Amount { get; set; }
    
    public DateTime Date { get; set; } = DateTime.UtcNow;
    
    [MaxLength(500)]
    public required string Description { get; set; }
    
    public TransactionType Type { get; set; }
    
    [MaxLength(3)]
    public string Currency { get; set; } = "EUR";
    
    // Foreign Keys
    public int UserId { get; set; }
    public int CategoryId { get; set; }
    
    // Navigation Properties
    public User? User { get; set; }
    public Category? Category { get; set; }
}
public enum TransactionType
{
    Income,
    Expense,
    Transfer
}