using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/transactions")]
[ApiController]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions()
        {
            var userId = Request.Headers["userId"].ToString();

            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out int parsedUserId))
            {
                return BadRequest("User ID in the request headers is not valid.");
            }

            // Carica le transazioni con le relazioni di categoria
            var transactions = await _context.Transactions
                .Where(t => t.UserId == parsedUserId)
                .Include(t => t.Category) // Eager loading della categoria
                .AsNoTracking() // Ottimizza performance
                .ToListAsync();

            return Ok(transactions);
        }


    
    [HttpPost]
        public async Task<ActionResult<Transaction>> AddTransaction(Transaction transaction)
        {
            // Recupera l'ID utente dall'intestazione
            var userId = Request.Headers["userId"].ToString();
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is missing from the request headers.");
            }

            if (!int.TryParse(userId, out int parsedUserId))
            {
                return BadRequest("User ID in the request headers is not a valid integer.");
            }

            // Associa l'ID utente alla transazione
            transaction.UserId = parsedUserId;
            
            if(transaction.Type != 0)
            {
                transaction.Amount = -transaction.Amount; // Se è una spesa, rendi il valore negativo
            }
            // Verifica che l'ID categoria sia valido
            if (transaction.CategoryId <= 0)
            {
                return BadRequest("Category ID is required and must be greater than zero.");
            }

            // Salva la transazione nel database
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTransactions), new { id = transaction.TransactionId }, transaction);
        }


}