using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

[Route("api/news")]
[ApiController]
public class NewsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _apiKey;
    private readonly ILogger<NewsController> _logger; // 🔹 Logger per debug

    public NewsController(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<NewsController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _apiKey = configuration["ApiKeys:NewsApiKey"]; // ✅ Prende la chiave API da appsettings.json
        _logger = logger; // 🔹 Inizializza il logger
    }

    [HttpGet("financial")]
    public async Task<IActionResult> GetFinancialNewsAsync()
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogError("API Key is missing. Check appsettings.json.");
            return StatusCode(500, "API Key is missing. Check appsettings.json.");
        }

        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, "https://api.apitube.io/v1/news/everything?limit=10&category.name=finanza&source.country.code=it");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        HttpResponseMessage response = await client.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        // 🔹 Stampa nel terminale
        _logger.LogInformation($"API Response: {responseBody}");
        Console.WriteLine($"API Response: {responseBody}");

        if (response.IsSuccessStatusCode)
        {
            return Content(responseBody, "application/json");
        }
        else
        {
            _logger.LogError($"Error {response.StatusCode}: {responseBody}");
            return StatusCode((int)response.StatusCode, $"Error: {response.ReasonPhrase} - {responseBody}");
        }
    }
}
