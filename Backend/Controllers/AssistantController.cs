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
            _apiKey = configuration["ApiKeys:HuggingFaceApiKey"]; // Prende la chiave API da appsettings.json
        }

        [HttpPost]
        public async Task<IActionResult> GetFinancialAdvice([FromBody] QueryRequest request)
        {
            var apiUrl = "https://router.huggingface.co/hf-inference/models/openai-community/gpt2";

            var payload = new
            {
                inputs = request.Query
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

            var response = await _httpClient.PostAsync(apiUrl, content);
            var responseString = await response.Content.ReadAsStringAsync();

            // Stampa la risposta nella console
            Console.WriteLine($"API Response: {responseString}");

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseString);
                var advice = jsonResponse[0].GetProperty("generated_text").GetString();
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