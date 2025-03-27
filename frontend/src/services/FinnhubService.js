// src/services/FinnhubService.js
const API_KEY = 'cviip3pr01qks9qapeogcviip3pr01qks9qapep0'; // Registrati su https://finnhub.io
const BASE_URL = 'https://finnhub.io/api/v1';

export const fetchHistoricalData = async (symbol, timeframe) => {
  try {
    const to = Math.floor(Date.now() / 1000);
    let from = to;
    
    switch(timeframe) {
      case '1M': from -= 2592000; break;
      case '3M': from -= 7776000; break;
      case '1Y': from -= 31536000; break;
      case '5Y': from -= 157680000; break;
      default: from = 0;
    }

    const response = await fetch(
      `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${API_KEY}`
    );
    
    const data = await response.json();
    return formatChartData(data, symbol);
  } catch (error) {
    console.error('Errore Finnhub:', error);
    throw error;
  }
};

export const fetchRealTimePrice = async (symbol) => {
  try {
    const response = await fetch(
      `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
    );
    const data = await response.json();
    return data.c;
  } catch (error) {
    console.error('Errore Finnhub:', error);
    throw error;
  }
};

const formatChartData = (data, symbol) => ({
  labels: data.t.map(timestamp => new Date(timestamp * 1000)),
  datasets: [{
    label: symbol,
    data: data.c,
    borderColor: '#1e3a8a',
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    borderWidth: 2,
    tension: 0.1
  }]
});
