using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
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
    
}