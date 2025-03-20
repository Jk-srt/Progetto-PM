using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class FinancialDataService
    {
        private readonly AppDbContext _context;

        public FinancialDataService(AppDbContext context)
        {
            _context = context;
        }

        // Esempio: Ottieni prezzo corrente di un asset
        public async Task<decimal> GetCurrentPrice(string ticker)
        {
            var asset = await _context.Assets.FirstOrDefaultAsync(a => a.Ticker == ticker);
            return asset != null ? 100.00M : 0M; // Valore di esempio
        }

        // Esempio: Sincronizza dati di mercato
        public async Task<List<Asset>> SyncMarketData()
        {
            var assets = await _context.Assets.ToListAsync();
            foreach (var asset in assets)
            {
                asset.Tipo = "Updated"; // Aggiorna i dati (placeholder)
            }

            await _context.SaveChangesAsync();
            return assets;
        }
    }
}
