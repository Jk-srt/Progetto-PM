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
    public async Task<IActionResult> GetFinancialNewsAsync()
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogError("API Key is missing. Check appsettings.json.");
            return StatusCode(500, "API Key is missing. Check appsettings.json.");
        }

        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, $"https://finnhub.io/api/v1/news?category=general&token={_apiKey}");

        HttpResponseMessage response;
        try
        {
            response = await client.SendAsync(request);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError($"Request error: {ex.Message}");
            return StatusCode(500, "Error making request to Finnhub API.");
        }

        var responseBody = await response.Content.ReadAsStringAsync();

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