// SerpapiController.cs
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Net;
using System.Text.Json;

[ApiController]
[Route("api/serp-proxy")]
public class SerpapiController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _apiKey;
    private const string SerpApiBaseUrl = "https://serpapi.com/search.json";
    private readonly ILogger<SerpapiController> _logger;

    public SerpapiController(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<SerpapiController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _apiKey = configuration["ApiKeys:SerpapiApiKey"];
        _logger = logger;
    }

    [HttpGet("historical-data")]
    public async Task<IActionResult> GetHistoricalData(
        [FromQuery] string symbol,
        [FromQuery] string timeframe)
    {
        try
        {
            var client = _httpClientFactory.CreateClient();
            // Chiamata con parametro 'window' corretto
            var url = $"{SerpApiBaseUrl}"
                    + $"?engine=google_finance"
                    + $"&q={WebUtility.UrlEncode(symbol + ":NASDAQ")}"
                    + $"&window={timeframe}"
                    + $"&no_cache=true"              // disabilita cache per debug :contentReference[oaicite:0]{index=0}
                    + $"&api_key={_apiKey}";
            var response = await client.GetAsync(url);

            var contentString = await response.Content.ReadAsStringAsync();
            _logger.LogInformation($"SerpApi Response: {contentString}");

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new 
                {
                    error   = $"Errore SerpApi: {response.ReasonPhrase}",
                    content = contentString
                });
            }

            using var jsonDocument = JsonDocument.Parse(contentString);
            var root = jsonDocument.RootElement;

            // Log per debug: quali proprietà arrivano
            var props = string.Join(", ", root.EnumerateObject().Select(p => p.Name));
            _logger.LogInformation($"Root properties: {props}");

            // Provo prima 'graph', poi 'stock_market_graph'
            JsonElement graphElement;
            if (root.TryGetProperty("graph", out graphElement) 
                && graphElement.ValueKind == JsonValueKind.Array)
            {
                _logger.LogInformation("Trovato `graph`");   // :contentReference[oaicite:1]{index=1}
            }
            else if (root.TryGetProperty("stock_market_graph", out graphElement) 
                     && graphElement.ValueKind == JsonValueKind.Array)
            {
                _logger.LogInformation("Trovato `stock_market_graph`");   // :contentReference[oaicite:2]{index=2}
            }
            else
            {
                return NotFound(new 
                {
                    error   = "Dati storici non trovati",
                    details = "Né `graph` né `stock_market_graph` presenti",
                    content = contentString
                });
            }

            // Estrazione e trasformazione dei dati
            var historicalData = new List<object>();
            foreach (var item in graphElement.EnumerateArray()){
                // Preleva price e date
                if (!item.TryGetProperty("price",   out var priceProp) ||
                    !item.TryGetProperty("date",    out var dateProp))
                {
                    _logger.LogWarning("Elemento graph mancante price/date: " + item);
                    continue;
                }

                // Parsing data
                var dateString = dateProp.GetString();
                var format     = "MMM dd yyyy, hh:mm tt 'UTC'zzz";
                if (!DateTimeOffset.TryParseExact(
                        dateString,
                        format,
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out var dto))
                {
                    _logger.LogWarning($"Data non parsata: {dateString}");
                    continue;
                }

                // Aggiungi ai dati storici
                historicalData.Add(new
                {
                    timestamp = dto.ToUnixTimeSeconds(),
                    price     = priceProp.GetDecimal()
                });
            }


            if (!historicalData.Any())
            {
                return NotFound(new 
                {
                    error   = "Nessun dato storico valido",
                    details = "Array presente ma senza elementi validi",
                    content = contentString
                });
            }

            _logger.LogInformation($"Primo elemento storico: {JsonSerializer.Serialize(historicalData.First())}");

            return Ok(new 
            {
                prices = historicalData
            });
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Errore parsing JSON");
            return BadRequest(new 
            {
                error   = "Formato JSON non valido",
                details = ex.Message,
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore critico");
            return StatusCode(500, new 
            {
                error   = "Errore interno del server",
                details = ex.Message
            });
        }
    }
}
