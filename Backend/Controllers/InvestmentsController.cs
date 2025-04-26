using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

[Route("api/investments")]
[ApiController]
public class InvestmentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public InvestmentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Investment>>> GetInvestments()
    {
        // Recupera l'ID utente dagli header della richiesta
        var userIdHeader = Request.Headers["userId"].ToString();

        if (string.IsNullOrEmpty(userIdHeader) || !int.TryParse(userIdHeader, out int parsedUserId))
        {
            return BadRequest("User ID in the request headers is not valid.");
        }

        // Query asincrona per ottenere gli investimenti dell'utente
        var investments = await _context.Investments
            .Where(t => t.UserId == parsedUserId)
            .ToListAsync();

        // Restituisci i risultati
        return Ok(investments);
    }

    [HttpPost]
    public async Task<ActionResult<Investment>> AddInvestment(Investment req)
    {
        // Recupera l'ID utente dagli header della richiesta
        var userIdHeader = Request.Headers["userId"].ToString();

        if (string.IsNullOrEmpty(userIdHeader) || !int.TryParse(userIdHeader, out int parsedUserId))
        {
            return BadRequest("User ID in the request headers is not valid.");
        }

        // Assegna l'ID utente all'investimento
        req.UserId = parsedUserId;

        // Se il tipo non è 0 (ad esempio, una spesa), rendi l'importo negativo
        if (req.Action != 0)
        {
            req.PurchasePrice = -req.PurchasePrice;
        }

        // Aggiungi l'investimento al database
        _context.Investments.Add(req);
        await _context.SaveChangesAsync();

        // Restituisci il risultato con CreatedAtAction
        return CreatedAtAction(nameof(GetInvestments), new { id = req.InvestmentId }, req);
    }
}