using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: Ottiene tutte le transazioni per un utente specifico
        [HttpGet]
        public async Task<IActionResult> GetTransactions([FromQuery] int userId)
        {
            var transactions = await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();

            return Ok(transactions);
        }

        // ✅ POST: Crea una nuova transazione
        [HttpPost]
        public async Task<IActionResult> CreateTransaction([FromBody] Transaction transaction)
        {
            // Controlla se UserId e CategoryId sono validi
            if (transaction.UserId == 0 || transaction.CategoryId == 0)
            {
                return BadRequest(new { message = "UserId e CategoryId sono obbligatori" });
            }

            // Aggiunge la transazione al database
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransactions), new { userId = transaction.UserId }, transaction);
        }
    }
}