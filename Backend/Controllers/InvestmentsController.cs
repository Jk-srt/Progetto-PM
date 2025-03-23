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
        return await _context.Investments.ToListAsync();
    }
}