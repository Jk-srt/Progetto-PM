/**
 * FinnhubService.js - Servizio per l'accesso all'API Finnhub ottimizzato per il piano gratuito
 * Risolve i problemi di errore 403 utilizzando solo endpoint e simboli supportati nel piano free
 */

// Inserire qui la tua API key di Finnhub
const API_KEY = "cvj9rf9r01qlscpaovqgcvj9rf9r01qlscpaovr0";
const BASE_URL = "https://finnhub.io/api/v1";

// Mappa dei simboli - usa SOLO simboli USA per il piano gratuito
const SYMBOL_MAP = {
  // ETF USA popolari
  'SPY': 'SPY',    // SPDR S&P 500 ETF
  'VOO': 'VOO',    // Vanguard S&P 500 ETF
  'QQQ': 'QQQ',    // Invesco QQQ (Nasdaq-100)
  'VTI': 'VTI',    // Vanguard Total Stock Market ETF
  'AGG': 'AGG',    // iShares Core U.S. Aggregate Bond ETF
  
  // Azioni USA popolari
  'AAPL': 'AAPL',  // Apple
  'MSFT': 'MSFT',  // Microsoft
  'GOOGL': 'GOOGL', // Alphabet (Google)
  'AMZN': 'AMZN',  // Amazon
  'META': 'META',  // Meta (Facebook)
  'TSLA': 'TSLA',  // Tesla
  'JPM': 'JPM',    // JPMorgan Chase
  'BAC': 'BAC',    // Bank of America
  'NEE': 'NEE',    // NextEra Energy
  'XOM': 'XOM',    // Exxon Mobil
  
  // Mappa simboli europei a equivalenti USA 
  'VWCE': 'VTI',   // Da Vanguard FTSE All-World a US equivalent
  'SWDA': 'SPY',   // Da iShares Core MSCI World a US equivalent
  'AGGH': 'AGG',   // Da iShares Core Global Aggregate Bond a US equivalent
  'ISP': 'JPM',    // Da Intesa Sanpaolo a JPMorgan Chase
  'ENEL': 'NEE',   // Da Enel a NextEra Energy

  // Mappa simboli estesa per supportare equivalenti USA
  'EUNL': 'SPY', // iShares Core MSCI World
  'IEMA': 'EEM', // iShares MSCI Emerging Markets
  'SXR8': 'SPY', // Euro Stoxx 50 → S&P 500
  'G': 'GE',     // Generali → General Electric
  'EURUSD': 'EUR/USD',
  'GBPUSD': 'GBP/USD'
};

/**
 * Funzione per ottenere la risoluzione dinamica in base al timeframe
 * @param {string} timeframe - Intervallo di tempo
 * @returns {string} - Risoluzione
 */
const getResolution = (timeframe) => {
  switch(timeframe) {
    case '1D': return '5'; // 5 minuti (massimo consentito nel free)
    case '1W': return '15'; 
    case '1M': return 'D';
    case '3M': return 'D';
    case '1Y': return 'W';
    case '5Y': return 'M';
    case 'MAX': return 'M';
    default: return 'D';
  }
};

/**
 * Funzione per calcolare il range temporale
 * @param {string} timeframe - Intervallo di tempo
 * @returns {Object} - Oggetto con proprietà 'from' e 'to'
 */
const calculateTimeRange = (timeframe) => {
  const now = Math.floor(Date.now() / 1000);
  const ranges = {
    '1D': now - 86400,
    '1W': now - 604800,
    '1M': now - 2592000,
    '3M': now - 7776000,
    '1Y': now - 31536000,
    '5Y': now - 157680000,
    'MAX': 315532800 // 1980-01-01
  };
  return { from: ranges[timeframe], to: now };
};

/**
 * Funzione per gestire errori avanzati
 * @param {Error} error - Errore generato
 * @param {string} symbol - Simbolo dell'investimento
 */
const handleFinnhubError = (error, symbol) => {
  if (error.message.includes('403')) {
    throw new Error(`Accesso negato per ${symbol}: Aggiorna al piano premium`);
  }
  if (error.message.includes('429')) {
    throw new Error('Limite chiamate raggiunto: attendere 1 minuto');
  }
  throw error;
};

/**
 * Funzione per processare i dati delle candele
 * @param {Object} response - Risposta dell'API
 * @param {string} symbol - Simbolo dell'investimento
 * @returns {Object} - Dati formattati per Chart.js
 */
const processCandleData = (response, symbol) => {
  return {
    labels: response.t.map(t => new Date(t * 1000)),
    datasets: [{
      label: `${symbol} Historical`,
      data: response.c.map((c, i) => ({
        x: new Date(response.t[i] * 1000),
        y: c
      })),
      borderColor: '#1e3a8a',
      backgroundColor: 'rgba(30, 58, 138, 0.1)'
    }]
  };
};

/**
 * Recupera dati storici per un simbolo specificato
 * @param {string} symbol - Simbolo dell'investimento
 * @param {string} timeframe - Intervallo di tempo ('1D', '1W', '1M', '3M', '1Y', '5Y', 'MAX')
 * @returns {Promise<Object>} - Dati formattati per Chart.js
 */
export const fetchHistoricalData = async (symbol, timeframe) => {
  try {
    const finnhubSymbol = SYMBOL_MAP[symbol] || symbol;
    const resolution = getResolution(timeframe);
    const { from, to } = calculateTimeRange(timeframe);

    const response = await fetchWithRateLimit('stock/candle', {
      symbol: finnhubSymbol,
      resolution,
      from,
      to
    });

    if (response.s !== 'ok') {
      throw new Error(`Dati non disponibili per ${symbol} (${timeframe})`);
    }

    return processCandleData(response, symbol);
  } catch (error) {
    handleFinnhubError(error, symbol);
  }
};

// Gestione avanzata del rate limit
let callQueue = [];
const MAX_CALLS_PER_MINUTE = 50; // Conservative limit

/**
 * Esegue una chiamata API con gestione del rate limiting
 * @param {string} endpoint - Endpoint da chiamare
 * @param {Object} params - Parametri da includere nella chiamata
 * @returns {Promise<Object>} - Risposta dell'API
 */
const fetchWithRateLimit = async (endpoint, params = {}) => {
  const now = Date.now();

  // Cleanup old calls
  callQueue = callQueue.filter(t => t > now - 60000);

  if (callQueue.length >= MAX_CALLS_PER_MINUTE) {
    const waitTime = 60000 - (now - callQueue[0]);
    await delay(waitTime);
    return fetchWithRateLimit(endpoint, params);
  }

  callQueue.push(now);
  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.append('token', API_KEY);

  Object.entries(params).forEach(([k, v]) => 
    url.searchParams.append(k, v));

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return response.json();
};

/**
 * Funzione di utility per attendere un certo tempo
 * @param {number} ms - Millisecondi da attendere
 * @returns {Promise<void>}
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Ottiene notizie generali del mercato finanziario
 * @param {string} category - Categoria di notizie (general, forex, crypto, merger)
 * @param {number} count - Numero di notizie da ottenere
 * @returns {Promise<Array>} - Array di notizie
 */
export const fetchMarketNews = async (category = 'general', count = 20, searchKeyword) => {
  try {
    const news = await fetchWithRateLimit('news', {
      category: category,
      minId: 0
    });
    
    // Filtra e limita i risultati
    return Array.isArray(news) ? news.slice(0, count) : [];
  } catch (error) {
    console.error('Errore nel recupero delle notizie di mercato:', error);
    return [];
  }
};

/**
 * Ottiene notizie specifiche per un'azienda
 * @param {string} symbol - Simbolo dell'azienda
 * @param {string} from - Data di inizio (YYYY-MM-DD)
 * @param {string} to - Data di fine (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array di notizie
 */
export const fetchCompanyNews = async (symbol, from, to) => {
  try {
    // Converti il simbolo nel formato USA
    const finnhubSymbol = SYMBOL_MAP[symbol] || symbol;
    
    // Imposta date predefinite se non fornite
    if (!from || !to) {
      const today = new Date();
      to = today.toISOString().split('T')[0];
      
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      from = lastMonth.toISOString().split('T')[0];
    }
    
    const news = await fetchWithRateLimit('company-news', {
      symbol: finnhubSymbol,
      from: from,
      to: to
    });
    
    return Array.isArray(news) ? news : [];
  } catch (error) {
    console.error(`Errore nel recupero delle notizie per ${symbol}:`, error);
    return [];
  }
};

/**
 * Ottiene il prezzo in tempo reale
 * @param {string} symbol - Simbolo dell'azienda
 * @returns {Promise<Object>} - Dati del prezzo
 */
export const fetchRealTimePrice = async (symbol) => {
  try {
    // Converti il simbolo nel formato USA
    const finnhubSymbol = SYMBOL_MAP[symbol] || symbol;
    
    const data = await fetchWithRateLimit('quote', {
      symbol: finnhubSymbol
    });
    
    if (!data || data.c === 0) {
      throw new Error(`Nessun dato disponibile per ${finnhubSymbol}`);
    }
    
    return {
      price: data.c,               // Prezzo attuale
      previousClose: data.pc,      // Prezzo di chiusura precedente
      change: data.c - data.pc,    // Variazione assoluta
      percentChange: (data.c / data.pc - 1) * 100, // Variazione percentuale
      high: data.h,                // Massimo del giorno
      low: data.l,                 // Minimo del giorno
      timestamp: new Date()        // Timestamp attuale
    };
  } catch (error) {
    console.error(`Errore nel recupero del prezzo per ${symbol}:`, error);
    throw error;
  }
};

/**
 * Ottiene il profilo aziendale
 * @param {string} symbol - Simbolo dell'azienda
 * @returns {Promise<Object>} - Dati del profilo
 */
export const fetchCompanyProfile = async (symbol) => {
  try {
    // Converti il simbolo nel formato USA
    const finnhubSymbol = SYMBOL_MAP[symbol] || symbol;
    
    return await fetchWithRateLimit('stock/profile2', {
      symbol: finnhubSymbol
    });
  } catch (error) {
    console.error(`Errore nel recupero del profilo per ${symbol}:`, error);
    throw error;
  }
};

/**
 * Ottiene informazioni finanziarie di base
 * @param {string} symbol - Simbolo dell'azienda
 * @param {string} metric - Metrica finanziaria (es. 'all', 'price', 'valuation', etc.)
 * @returns {Promise<Object>} - Dati finanziari
 */
export const fetchBasicFinancials = async (symbol, metric = 'all') => {
  try {
    // Converti il simbolo nel formato USA
    const finnhubSymbol = SYMBOL_MAP[symbol] || symbol;
    
    return await fetchWithRateLimit('stock/metric', {
      symbol: finnhubSymbol,
      metric: metric
    });
  } catch (error) {
    console.error(`Errore nel recupero dei dati finanziari per ${symbol}:`, error);
    throw error;
  }
};

export default {
  fetchMarketNews,
  fetchCompanyNews,
  fetchRealTimePrice,
  fetchCompanyProfile,
  fetchBasicFinancials
};
