using System.ComponentModel.DataAnnotations;

namespace Backend.Models;
public class Asset
{
    public int AssetId { get; set; }
    
    [MaxLength(100)]
    public string Nome { get; set; }
    
    [MaxLength(10)]
    public string Ticker { get; set; }
    
    [MaxLength(50)]
    public string Tipo { get; set; }
    
    [MaxLength(12)]
    public string ISIN { get; set; }
    
    [MaxLength(10)]
    public string Symbol { get; set; }
    
    public List<Investment> Investments { get; set; }
    //public List<FinancialNews> FinancialNews { get; set; }
}