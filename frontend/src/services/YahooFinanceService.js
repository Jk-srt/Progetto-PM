import axios from 'axios';

// Base URL per le richieste API di Yahoo Finance
const API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';

// Mappa dei simboli per Yahoo Finance
const SYMBOL_MAP = {
  'VWCE': 'VWCE.MI',
  'SWDA': 'SWDA.MI',
  'AGGH': 'AGGH.MI',
  'ISP': 'ISP.MI',
  'ENEL': 'ENEL.MI',
};

/**
 * Recupera dati in tempo reale per un simbolo specifico
 * @param {string} symbol - Simbolo dell'investimento
 * @param {string} interval - Intervallo temporale ('1m', '5m', '15m', etc.)
 * @returns {Promise<Object>} - Dati formattati per il grafico
 */
export const fetchRealTimeData = async (symbol, interval = '1m') => {
  try {
    // Converti il simbolo interno al formato Yahoo Finance
    const yahooSymbol = SYMBOL_MAP[symbol] || symbol;
    
    // Configurazione proxy per evitare problemi CORS
    const config = {
      params: {
        interval: interval,
        range: '1d',
        includePrePost: true
      }
    };
    
    // In ambiente di produzione, dovresti usare un proxy sul tuo server
    // Per lo sviluppo, puoi usare cors-anywhere (ma ha limiti di utilizzo)
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const fullUrl = `${proxyUrl}${API_BASE_URL}${yahooSymbol}`;
    
    const response = await axios.get(fullUrl, config);
    
    if (response.data && response.data.chart && 
        response.data.chart.result && response.data.chart.result.length > 0) {
      return formatChartData(response.data.chart.result[0], symbol);
    }
    
    throw new Error('Dati non disponibili');
  } catch (error) {
    console.error(`Errore nel recupero dei dati per ${symbol}:`, error);
    throw error;
  }
};

/**
 * Formatta i dati grezzi di Yahoo Finance per Chart.js
 * @param {Object} rawData - Dati grezzi dalla risposta API
 * @param {string} label - Etichetta per il dataset
 * @returns {Object} - Dati formattati per Chart.js
 */
const formatChartData = (rawData, label) => {
  const timestamps = rawData.timestamp || [];
  const quote = rawData.indicators.quote[0] || {};
  const prices = quote.close || [];
  
  // Converti timestamp in oggetti Date e filtra dati invalidi
  const validData = timestamps.reduce((acc, timestamp, index) => {
    if (timestamp && prices[index] !== null && prices[index] !== undefined) {
      acc.labels.push(new Date(timestamp * 1000));
      acc.data.push(prices[index]);
    }
    return acc;
  }, { labels: [], data: [] });
  
  return {
    labels: validData.labels,
    datasets: [
      {
        label: label,
        data: validData.data,
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointRadius: 0
      }
    ]
  };
};

/**
 * Funzione di polling per aggiornamenti dei prezzi in tempo reale
 * @param {string} symbol - Simbolo dell'investimento
 * @param {function} onData - Callback per nuovi dati
 * @param {number} interval - Intervallo di polling in millisecondi
 * @returns {Object} - Oggetto con metodo per interrompere il polling
 */
export const startPricePolling = (symbol, onData, interval = 10000) => {
  const pollingId = setInterval(async () => {
    try {
      const data = await fetchRealTimeData(symbol, '1m');
      if (data && data.datasets && data.datasets[0].data.length > 0) {
        onData(data);
      }
    } catch (error) {
      console.error('Errore nel polling dei dati:', error);
    }
  }, interval);
  
  return {
    stop: () => clearInterval(pollingId)
  };
};
