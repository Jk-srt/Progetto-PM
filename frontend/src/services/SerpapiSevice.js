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
    const response = await fetch(
      `/api/serp-proxy/historical-data?symbol=${symbol}&timeframe=${timeframe}`
    );

    const data = await response.json();
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore sconosciuto');
      }

    if (!data.price_history || !data.price_history.prices) {
      throw new Error('Dati storici non disponibili');
    }

    return {
      labels: data.price_history.prices.map(p => new Date(p.timestamp * 1000)),
      datasets: [{
        label: `${symbol} Storico`,
        data: data.price_history.prices.map(p => ({
          x: new Date(p.timestamp * 1000),
          y: p.price
        })),
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)'
      }]
    };
  } catch (error) {
    console.error('Errore SerpApi:', error);
    throw new Error(`Errore nel recupero dati: ${error.message}`);
  }
};
