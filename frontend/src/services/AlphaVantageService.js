// alphaVantageService.js

/**
 * Recupera dati storici da /api/alpha-proxy/historical-data
 * @param {string} symbol     Simbolo del titolo (es. "MSFT", "AAPL")
 * @param {string} timeframe  Timeframe desiderato ("1D", "1W", "1M", "3M", "1Y", "5Y", "MAX")
 * @returns {Promise<{ labels: Date[], datasets: { data: { x: Date, y: number }[] }[] }>}
 */
export async function fetchHistoricalData(symbol, timeframe) {
    const url = new URL(`api/alpha-proxy/historical-data`, window.location.origin);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('timeframe', timeframe);
  
    // Imposta timeout manuale a 10s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);
  
    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || `HTTP ${response.status}`);
      }
  
      const payload = await response.json();
      if (!payload.prices || !Array.isArray(payload.prices)) {
        throw new Error('Formato dati inatteso');
      }
  
      // Trasforma in struttura Chart.js
      const entries = payload.prices
        .map(p => ({
          x: new Date(p.timestamp * 1000),
          y: p.price
        }))
        .sort((a, b) => a.x - b.x);
  
      return {
        labels: entries.map(e => e.x),
        datasets: [{ data: entries }]
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Timeout nella chiamata API');
      }
      console.error('fetchHistoricalData error:', err);
      throw err;
    }
  }
  