using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AndamentoController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _alphaVantageApiKey;

        public AndamentoController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = _httpClientFactory;
            _alphaVantageApiKey = configuration["ApiKeys:AlphaVantageApiKey"];
        }

        [HttpGet("etf/{symbol}")]
        public async Task<IActionResult> GetEtfData(string symbol)
        {
            var client = _httpClientFactory.CreateClient();
            var historicalUrl = $"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={_alphaVantageApiKey}";
            var realtimeUrl = $"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={_alphaVantageApiKey}";

            try
            {
                var historicalResponse = await client.GetStringAsync(historicalUrl);
                var realtimeResponse = await client.GetStringAsync(realtimeUrl);

                var historicalData = JObject.Parse(historicalResponse);
                var realtimeData = JObject.Parse(realtimeResponse);

                if (historicalData["Error Message"] != null || realtimeData["Global Quote"] == null)
                {
                    return BadRequest("Invalid API call. Please check the symbol and try again.");
                }

                return Ok(new { historical = historicalData, realtime = realtimeData });
            }
            catch (HttpRequestException e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchSymbols([FromQuery] string query)
        {
            var client = _httpClientFactory.CreateClient();
            var searchUrl = $"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={query}&apikey={_alphaVantageApiKey}";

            try
            {
                var searchResponse = await client.GetStringAsync(searchUrl);
                var searchData = JObject.Parse(searchResponse);

                if (searchData["Error Message"] != null)
                {
                    return BadRequest("Invalid API call. Please check the query and try again.");
                }

                return Ok(searchData);
            }
            catch (HttpRequestException e)
            {
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}