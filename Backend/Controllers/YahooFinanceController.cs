using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace ProgettoPM.Backend.Controllers
{
    [ApiController]
    [Route("api/yahoo")]
    public class YahooFinanceController : ControllerBase
    {
        private static readonly HttpClient _http = new HttpClient();

        [HttpGet("historical")]
        public async Task<IActionResult> GetHistoricalV2(string symbol, string timeframe)
        {
            DateTime end = DateTime.UtcNow;
            DateTime start = timeframe switch
            {
                "1W" => end.AddDays(-7),
                "1M" => end.AddMonths(-1),
                "3M" => end.AddMonths(-3),
                "1Y" => end.AddYears(-1),
                "5Y" => end.AddYears(-5),
                _    => end.AddMonths(-1)
            };

            string startTimestamp = ((DateTimeOffset)start).ToUnixTimeSeconds().ToString();
            string endTimestamp = ((DateTimeOffset)end).ToUnixTimeSeconds().ToString();

            string url = $"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?period1={startTimestamp}&period2={endTimestamp}&interval=1d";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

            var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Yahoo Finance request failed");
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var timestamps = doc.RootElement
                .GetProperty("chart")
                .GetProperty("result")[0]
                .GetProperty("timestamp")
                .EnumerateArray()
                .Select(t => DateTimeOffset.FromUnixTimeSeconds(t.GetInt64()).UtcDateTime)
                .ToArray();

            var closes = doc.RootElement
                .GetProperty("chart")
                .GetProperty("result")[0]
                .GetProperty("indicators")
                .GetProperty("quote")[0]
                .GetProperty("close")
                .EnumerateArray()
                .Select(c => c.GetDecimal())
                .ToArray();

            var entries = timestamps.Zip(closes, (time, close) => new { x = time, y = close });

            return Ok(new
            {
                labels = entries.Select(e => e.x),
                datasets = new[] { new { data = entries } }
            });
        }


        [HttpGet("listing")]
        public async Task<IActionResult> SearchListing(string query = "")
        {
            string url = $"https://query2.finance.yahoo.com/v1/finance/search" +
                        $"?q={Uri.EscapeDataString(query)}&lang=en-US&region=US";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

            var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Yahoo Finance request failed");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("quotes", out var quotes))
                return Ok(Array.Empty<object>());

            var list = quotes
                .EnumerateArray()
                .Select(q =>
                {
                    // symbol (dovrebbe esserci sempre)
                    string symbol = q.TryGetProperty("symbol", out var pSym) 
                                        ? pSym.GetString()! 
                                        : "";

                    // longname → shortname → symbol
                    string name = 
                        q.TryGetProperty("longname", out var pLong) && pLong.ValueKind == JsonValueKind.String
                            ? pLong.GetString()!
                        : q.TryGetProperty("shortname", out var pShort) && pShort.ValueKind == JsonValueKind.String
                            ? pShort.GetString()!
                        : symbol;

                    // exchange (fallback a string vuota)
                    string exchange = q.TryGetProperty("exchange", out var pEx) && pEx.ValueKind == JsonValueKind.String
                                        ? pEx.GetString()!
                                        : "";

                    // quoteType (fallback a "unknown")
                    string type = q.TryGetProperty("quoteType", out var pType) && pType.ValueKind == JsonValueKind.String
                                        ? pType.GetString()!
                                        : "unknown";

                    return new { symbol, name, exchange, type };
                })
                .ToList();

            return Ok(list);
        }


        [HttpGet("realtime")]
        public async Task<IActionResult> GetRealTimeV2(string symbol)
        {
            string url = $"https://query1.finance.yahoo.com/v7/finance/quote?symbols={symbol}";

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

            var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Yahoo Finance request failed");
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            var resultArray = doc.RootElement
                .GetProperty("quoteResponse")
                .GetProperty("result");

            if (resultArray.GetArrayLength() == 0)
                return NotFound();

            var quote = resultArray[0];

            return Ok(new
            {
                price         = quote.GetProperty("regularMarketPrice").GetDecimal(),
                change        = quote.GetProperty("regularMarketChange").GetDecimal(),
                percentChange = quote.GetProperty("regularMarketChangePercent").GetDecimal(),
                open          = quote.GetProperty("regularMarketOpen").GetDecimal(),
                high          = quote.GetProperty("regularMarketDayHigh").GetDecimal(),
                low           = quote.GetProperty("regularMarketDayLow").GetDecimal(),
                prevClose     = quote.GetProperty("regularMarketPreviousClose").GetDecimal()
            });
        }

    }
}
