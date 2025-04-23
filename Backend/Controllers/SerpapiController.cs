// SerpapiController.cs
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class SerpapiController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _apiKey;
    private const string SerpApiBaseUrl = "https://serpapi.com/search.json";

    public SerpapiController(IHttpClientFactory httpClientFactory,IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _apiKey = configuration["ApiKeys:SerpapiApiKey"];

    }

    [HttpGet("historical-data")]
    public async Task<IActionResult> GetHistoricalData(
        [FromQuery] string symbol, 
        [FromQuery] string timeframe)
    {
        try
        {
            using var client = _httpClientFactory.CreateClient();
            
            var response = await client.GetAsync($"{SerpApiBaseUrl}?" +
                $"engine=google_finance" +
                $"&q={WebUtility.UrlEncode(symbol)}" +
                $"&tbm={MapTimeframe(timeframe)}" +
                $"&api_key={Environment.GetEnvironmentVariable("SERPAPI_KEY")}");

            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadFromJsonAsync<JsonElement>();
            return Ok(content);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode((int)ex.StatusCode.GetValueOrDefault((HttpStatusCode)500), 
                new { error = ex.Message });
        }
    }

    private static string MapTimeframe(string timeframe)
    {
        return timeframe switch
        {
            "1D" => "1d",
            "1W" => "5d",
            "1M" => "1mo",
            "3M" => "3mo",
            "1Y" => "1y",
            "5Y" => "5y",
            "MAX" => "max",
            _ => "1d"
        };
    }
}
