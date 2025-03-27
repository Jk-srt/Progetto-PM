const API_KEY = 'cviip3pr01qks9qapeogcviip3pr01qks9qapep0';
const BASE_URL = 'https://finnhub.io/api/v1';

// Funzione per attendere un determinato numero di millisecondi
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchHistoricalData = async (symbol, timeframe) => {
  try {
    const to = Math.floor(Date.now() / 1000);
    let from = to;
    let resolution = 'D';

    switch(timeframe) {
      case '1M':
        from -= 2592000; // 30 giorni
        resolution = '60'; // 1 ora
        break;
      case '3M':
        from -= 7776000; // 90 giorni
        resolution = '60'; // 1 ora
        break;
      case '1Y':
        from -= 31536000; // 365 giorni
        resolution = 'D'; // Giornaliero
        break;
      case '5Y':
        from -= 157680000; // 5 anni
        resolution = 'W'; // Settimanale
        break;
      default:
        throw new Error('Timeframe non supportato');
    }

    // Attendi per rispettare i limiti dell'API
    await sleep(1000); // Attende 1 secondo tra le richieste

    const response = await fetch(
        `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
    );

    const data = await response.json();

    if (data.s !== 'ok') {
      throw new Error(`Errore nella risposta dell'API: ${data.s}`);
    }

    return formatChartData(data, symbol);
  } catch (error) {
    console.error('Errore Finnhub:', error);
    throw error;
  }
};

export const fetchRealTimePrice = async (symbol) => {
  try {
    // Attendi per rispettare i limiti dell'API
    await sleep(1000); // Attende 1 secondo tra le richieste

    const response = await fetch(
        `${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`
    );
    const data = await response.json();

    if (!data || data.c === undefined) {
      throw new Error('Dati non validi ricevuti dall\'API');
    }

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
