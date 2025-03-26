using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Progetto_PM.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistantController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public AssistantController(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["ApiKeys:GeminiApiKey"];
        }

        [HttpPost]
        public async Task<IActionResult> GetFinancialAdvice([FromBody] QueryRequest request)
        {
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}";

            // Prefigura la domanda dell'utente con un contesto finanziario
            var financialPrompt = $"Come consulente finanziario, rispondi alla seguente domanda: {request.Query}";

            var payload = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = financialPrompt } } }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(apiUrl, content);
            var responseString = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseString);
                var advice = jsonResponse.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
                return Ok(new { response = advice });
            }
            else
            {
                return StatusCode((int)response.StatusCode, responseString);
            }
        }
    }

    public class QueryRequest
    {
        public string Query { get; set; }
    }
}
