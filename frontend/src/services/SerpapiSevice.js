// SerpApiService.js - Nuovo servizio per dati storici
const API_KEY = "ede53b65c86bd86fa204b36364c485ea1e0241bd982d4df497571fc379f03ce2";
const BASE_URL = "https://serpapi.com/search.json";

const timeframeToDateRange = (timeframe) => {
  const now = new Date();
  const ranges = {
    '1D': { 
      period: '1d',
      interval: '15m' 
    },
    '1W': {
      period: '5d',
      interval: '1h'
    },
    '1M': {
      period: '1mo',
      interval: '1d'
    },
    '3M': {
      period: '3mo',
      interval: '1d'
    },
    '1Y': {
      period: '1y',
      interval: '1wk'
    },
    '5Y': {
      period: '5y',
      interval: '1mo'
    },
    'MAX': {
      period: 'max',
      interval: '1mo'
    }
  };
  return ranges[timeframe] || ranges['1D'];
};

export const fetchHistoricalData = async (symbol, timeframe) => {
  try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
          `http://localhost:5000/api/serp-proxy/historical-data?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`,
          {
              signal: controller.signal,
              headers: {
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest'
              }
          }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Invalid content type: ${contentType} - Response: ${text.slice(0, 100)}`);
      }

      const data = await response.json();

      if (!data?.prices) {
          throw new Error('Dati storici non disponibili nella risposta');
      }

      return {
        labels: data.prices.map(p => new Date(p.timestamp * 1000)),
        datasets: [{
          data: data.prices.map(p => ({ 
            x: new Date(p.timestamp * 1000), 
            y: p.price 
          }))
        }]
      };
  } catch (error) {
      console.error('Errore SerpApi:', {
          message: error.message,
          stack: error.stack,
          symbol,
          timeframe
      });
      throw new Error(`Errore nel recupero dati: ${error.message}`);
  }
};


