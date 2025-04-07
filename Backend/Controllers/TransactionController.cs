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
        return await _context.Transactions.ToListAsync();
    }
    [HttpPost]
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