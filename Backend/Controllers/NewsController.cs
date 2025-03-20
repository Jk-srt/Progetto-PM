using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Net.Http.Headers;

[Route("api/[controller]")]
[ApiController]
public class NewsController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public NewsController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpGet("financial")]
    public async Task<IActionResult> GetFinancialNewsAsync()
    {
        // Imposta l'header Authorization in modo sicuro
        if (!_httpClient.DefaultRequestHeaders.Contains("Authorization"))
        {
            _httpClient.DefaultRequestHeaders.Add("Authorization", "api_live_r1WOpVoWXOUQwgWHUlLlx05m6xp94Lg8Ke3icJ3eotSrtGs1h6aR");
        }

        HttpResponseMessage response = await _httpClient.GetAsync("https://api.apitube.io/v1/news?category=finanza");
        if (response.IsSuccessStatusCode)
        {
            string responseBody = await response.Content.ReadAsStringAsync();
            // Potresti deserializzare il JSON qui se necessario
            return Ok(responseBody);
        }
        else
        {
            return StatusCode((int)response.StatusCode, response.ReasonPhrase);
        }
    }
}
