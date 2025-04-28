using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

[Route("api/news")]
[ApiController]
public class NewsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _apiKey;
    private readonly ILogger<NewsController> _logger;

    public NewsController(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<NewsController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _apiKey = configuration["ApiKeys:FinnhubApiKey"];
        _logger = logger;
    }

    [HttpGet("financial")]
    public async Task<IActionResult> GetFinancialNewsAsync(
        [FromQuery] string category = "general",
        [FromQuery] int count = 30,
        [FromQuery] string q = "")
    {
        Console.WriteLine($"[NewsController] Richiesta ricevuta: category={category}, count={count}, q={q}");

        var client = _httpClientFactory.CreateClient();
        var url = $"https://finnhub.io/api/v1/news?category={category}&token={_apiKey}";
        if (!string.IsNullOrWhiteSpace(q))
            url += $"&q={Uri.EscapeDataString(q)}";

        Console.WriteLine($"[NewsController] Chiamo API esterna: {url}");

        try
        {
            var response = await client.GetAsync(url);
            Console.WriteLine($"[NewsController] Risposta API esterna: {response.StatusCode}");
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[NewsController] Errore da Finnhub: {content}");
                return StatusCode((int)response.StatusCode, content);
            }

            return Content(content, "application/json");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[NewsController] Errore: {ex}");
            return StatusCode(500, "Errore interno del server");
        }
    }
}