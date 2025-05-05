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
    
    [HttpPut("{id}")]
    public async Task<ActionResult<Investment>> UpdateInvestment(int id, Investment req)
    {
        // Recupera l'ID utente dagli header della richiesta
        var userIdHeader = Request.Headers["userId"].ToString();
        if (string.IsNullOrEmpty(userIdHeader) || !int.TryParse(userIdHeader, out int parsedUserId))
        {
            return BadRequest("User ID in the request headers is not valid.");
        }

        // Verifica che l'ID nell'URL coincida con l'ID nell'oggetto
        if (id != req.InvestmentId)
        {
            return BadRequest("ID mismatch between URL and object.");
        }

        // Verifica che l'investimento appartenga all'utente
        var existingInvestment = await _context.Investments
            .FirstOrDefaultAsync(i => i.InvestmentId == id && i.UserId == parsedUserId);
    
        if (existingInvestment == null)
        {
            return NotFound($"Investment with ID {id} not found for this user.");
        }

        // Aggiorna le proprietà dell'investimento esistente
        existingInvestment.Quantity = req.Quantity;
        existingInvestment.PurchasePrice = req.PurchasePrice;
        existingInvestment.PurchaseDate = req.PurchaseDate;
        existingInvestment.AssetName = req.AssetName;
        existingInvestment.Action = req.Action;
    
        // Se necessario, aggiorna anche il prezzo corrente
        if (req.CurrentPrice.HasValue)
        {
            existingInvestment.CurrentPrice = req.CurrentPrice;
        }

        // Marca l'entità come modificata
        _context.Entry(existingInvestment).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!InvestmentExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return Ok(existingInvestment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInvestment(int id)
    {
        // Retrieve user ID from request headers
        var userIdHeader = Request.Headers["userId"].ToString();
        if (string.IsNullOrEmpty(userIdHeader) || !int.TryParse(userIdHeader, out int parsedUserId))
        {
            return BadRequest("User ID in the request headers is not valid.");
        }

        // Find investment with both ID and user ID to ensure proper authorization
        var investment = await _context.Investments
            .FirstOrDefaultAsync(i => i.InvestmentId == id && i.UserId == parsedUserId);

        if (investment == null)
        {
            return NotFound($"Investment with ID {id} not found for this user.");
        }

        // Remove the investment
        _context.Investments.Remove(investment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Investment deleted successfully" });
    }

    private bool InvestmentExists(int id)
    {
        return _context.Investments.Any(e => e.InvestmentId == id);
    }

}
