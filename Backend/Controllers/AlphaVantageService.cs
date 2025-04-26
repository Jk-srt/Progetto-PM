using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Net;
using System.Text.Json;

[ApiController]
[Route("api/alpha-proxy")]
public class AlphaVantageController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _apiKey;
    private readonly ILogger<AlphaVantageController> _logger;
    private const string AlphaVantageBaseUrl = "https://www.alphavantage.co/query";

    public AlphaVantageController(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<AlphaVantageController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _apiKey = configuration["ApiKeys:AlphaVantageApiKey"];
        _logger = logger;
    }

    [HttpGet("historical-data")]
    public async Task<IActionResult> GetHistoricalData(
        [FromQuery] string symbol,
        [FromQuery] string timeframe)
    {
        try
        {
            var (function, interval) = MapTimeframeToFunctionAndInterval(timeframe);
            var queryParams = new Dictionary<string, string>
            {
                { "function", function },
                { "symbol", symbol },
                { "apikey", _apiKey },
                { "outputsize", "full" },
                { "datatype", "json" }
            };
            if (!string.IsNullOrEmpty(interval))
            {
                queryParams.Add("interval", interval);
            }

            var queryString = string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={WebUtility.UrlEncode(kvp.Value)}"));
            var url = $"{AlphaVantageBaseUrl}?{queryString}";

            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);
            var contentString = await response.Content.ReadAsStringAsync();

            _logger.LogInformation($"Alpha Vantage Response: {contentString}");

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new
                {
                    error = $"Errore Alpha Vantage: {response.ReasonPhrase}",
                    content = contentString
                });
            }

            using var jsonDocument = JsonDocument.Parse(contentString);
            var root = jsonDocument.RootElement;

            var timeSeriesProperty = root.EnumerateObject()
                .FirstOrDefault(p => p.Name.Contains("Time Series"));

            if (timeSeriesProperty.Equals(default(JsonProperty)))
            {
                return NotFound(new
                {
                    error = "Dati storici non trovati",
                    details = "Proprietà 'Time Series' non presente nella risposta",
                    content = contentString
                });
            }

            var timeSeries = timeSeriesProperty.Value;
            var historicalData = new List<object>();

            foreach (var item in timeSeries.EnumerateObject())
            {
                if (!DateTime.TryParse(item.Name, out var date))
                {
                    _logger.LogWarning($"Data non parsata: {item.Name}");
                    continue;
                }

                if (!item.Value.TryGetProperty("4. close", out var closeProp))
                {
                    _logger.LogWarning($"Prezzo di chiusura mancante per la data: {item.Name}");
                    continue;
                }

                if (!decimal.TryParse(closeProp.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var close))
                {
                    _logger.LogWarning($"Prezzo di chiusura non valido per la data: {item.Name}");
                    continue;
                }

                historicalData.Add(new
                {
                    timestamp = new DateTimeOffset(date).ToUnixTimeSeconds(),
                    price = close
                });
            }

            if (!historicalData.Any())
            {
                return NotFound(new
                {
                    error = "Nessun dato storico valido",
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
                error = "Formato JSON non valido",
                details = ex.Message,
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Errore critico");
            return StatusCode(500, new
            {
                error = "Errore interno del server",
                details = ex.Message
            });
        }
    }

    private (string function, string interval) MapTimeframeToFunctionAndInterval(string timeframe)
    {
        return timeframe switch
        {
            "1D" => ("TIME_SERIES_INTRADAY", "15min"),
            "1W" => ("TIME_SERIES_INTRADAY", "60min"),
            "1M" => ("TIME_SERIES_DAILY", null),
            "3M" => ("TIME_SERIES_DAILY", null),
            "1Y" => ("TIME_SERIES_WEEKLY", null),
            "5Y" => ("TIME_SERIES_MONTHLY", null),
            "MAX" => ("TIME_SERIES_MONTHLY", null),
            _ => ("TIME_SERIES_DAILY", null),
        };
    }
}
