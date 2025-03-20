/**
 * InvestmentDataService.js
 * Servizio per recuperare dati di investimenti da Yahoo Finance con fallback a dati simulati.
 */

// Mappa tra i simboli interni dell'app e i simboli Yahoo Finance
const SYMBOL_MAP = {
    'VWCE': 'VWCE.MI',        // Vanguard FTSE All-World UCITS ETF su Borsa Italiana
    'SWDA': 'SWDA.MI',        // iShares Core MSCI World UCITS ETF su Borsa Italiana
    'AGGH': 'AGGH.MI',        // iShares Core Global Aggregate Bond UCITS ETF su Borsa Italiana
    'ISP': 'ISP.MI',          // Intesa Sanpaolo su Borsa Italiana
    'ENEL': 'ENEL.MI',        // Enel su Borsa Italiana
    'IWDA': 'IWDA.AS',        // iShares Core MSCI World UCITS ETF su Amsterdam
    'EXSA': 'EXSA.MI',        // Amundi MSCI Emerging ESG Leaders su Borsa Italiana
    'SGLD': 'SGLD.MI',        // Invesco Physical Gold ETC su Borsa Italiana
    // Aggiungi altri simboli secondo necessità
  };
  
  // Mappa tra intervalli di tempo e parametri per Yahoo Finance
  const TIMERANGE_MAP = {
    '1M': { interval: '1d', range: '1mo' },
    '3M': { interval: '1d', range: '3mo' },
    '1Y': { interval: '1d', range: '1y' },
    '5Y': { interval: '1wk', range: '5y' },
    'MAX': { interval: '1mo', range: 'max' }
  };
  
  /**
   * Ottiene dati storici reali da Yahoo Finance
   * @param {string} investmentId - ID interno dell'investimento
   * @param {string} timeRange - Intervallo temporale ('1M', '3M', '1Y', '5Y', 'MAX')
   * @returns {Promise<Object>} Dati formattati per Chart.js
   */
  export const getInvestmentData = async (investmentId, timeRange) => {
    try {
      const yahooSymbol = SYMBOL_MAP[investmentId] || investmentId;
      const timeParams = TIMERANGE_MAP[timeRange] || TIMERANGE_MAP['1Y'];
      
      const data = await fetchYahooFinanceData(yahooSymbol, timeParams.interval, timeParams.range);
      
      if (data && data.prices && data.prices.length > 0) {
        // Trasforma i dati Yahoo nel formato per Chart.js
        return formatYahooDataForChart(data, investmentId);
      } else {
        console.warn(`Nessun dato ricevuto da Yahoo Finance per ${yahooSymbol}. Utilizzando dati simulati.`);
        return getMockPerformanceData(investmentId, timeRange);
      }
    } catch (error) {
      console.error(`Errore nel recupero dei dati da Yahoo Finance:`, error);
      // Fallback ai dati simulati in caso di errore
      console.warn(`Utilizzo dati simulati per ${investmentId}`);
      return getMockPerformanceData(investmentId, timeRange);
    }
  };
  
  /**
   * Esegue la richiesta API a Yahoo Finance
   * @param {string} symbol - Simbolo Yahoo Finance
   * @param {string} interval - Intervallo candle ('1d', '1wk', '1mo')
   * @param {string} range - Intervallo temporale ('1mo', '3mo', '1y', '5y', 'max')
   * @returns {Promise<Object>} Dati grezzi da Yahoo Finance
   */
  async function fetchYahooFinanceData(symbol, interval, range) {
    // Utilizziamo proxy CORS e rapidapi-key per accedere ai dati Yahoo Finance
    // In alternativa, potresti implementare un proxy nel tuo backend
    const url = `https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          // Opzionale: aggiungi una chiave RapidAPI per evitare limiti di utilizzo
          // 'x-rapidapi-key': 'LA_TUA_CHIAVE_RAPID_API_QUI',
          // 'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Errore API Yahoo Finance: ${response.status}`);
      }
      
      const jsonData = await response.json();
      return jsonData.chart.result[0];
    } catch (error) {
      console.error('Errore durante il recupero dei dati da Yahoo Finance:', error);
      throw error;
    }
  }
  
  /**
   * Formatta i dati Yahoo Finance per Chart.js
   * @param {Object} yahooData - Dati grezzi da Yahoo Finance
   * @param {string} label - Etichetta per il dataset
   * @returns {Object} Dati formattati per Chart.js
   */
  function formatYahooDataForChart(yahooData, label) {
    const timestamps = yahooData.timestamp;
    const closePrices = yahooData.indicators.quote[0].close;
    
    // Crea array di date da timestamp Unix
    const dates = timestamps.map(timestamp => new Date(timestamp * 1000));
    
    // Filtra elementi con prezzo null
    const validDataPoints = dates.reduce((acc, date, index) => {
      if (closePrices[index] !== null) {
        acc.dates.push(date);
        acc.prices.push(closePrices[index]);
      }
      return acc;
    }, { dates: [], prices: [] });
    
    // Se c'è un dataset di confronto (benchmark), ottienilo
    let benchmarkData = null;
    if (yahooData.comparisons && yahooData.comparisons.length > 0) {
      benchmarkData = yahooData.comparisons[0].close;
    }
    
    // Prepara i dataset per Chart.js
    const datasets = [
      {
        label: label,
        data: validDataPoints.prices,
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true,
        pointRadius: 0,
      }
    ];
    
    // Aggiungi benchmark se disponibile
    if (benchmarkData) {
      datasets.push({
        label: 'Benchmark',
        data: benchmarkData,
        borderColor: '#FF6384',
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.1,
        fill: false,
        pointRadius: 0,
      });
    }
    
    return {
      labels: validDataPoints.dates,
      datasets,
    };
  }
  
  /**
   * Metodo alternativo: recupero dati via Finnhub API
   * @param {string} symbol - Simbolo dell'investimento
   * @param {string} resolution - Risoluzione candle ('D', 'W', 'M')
   * @param {number} from - Timestamp inizio
   * @param {number} to - Timestamp fine
   * @returns {Promise<Object>} Dati Finnhub
   */
  async function fetchFinnhubData(symbol, resolution, from, to) {
    // Implementazione alternativa usando Finnhub
    // Richiede registrazione su finnhub.io per ottenere un API key gratuito
    const apiKey = 'TUA_API_KEY_FINNHUB';
    const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Errore API Finnhub: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Errore durante il recupero dei dati da Finnhub:', error);
      throw error;
    }
  }
  
  /**
   * Ottiene informazioni dettagliate sull'investimento
   * @param {string} symbol - Simbolo dell'investimento
   * @returns {Promise<Object>} Informazioni dettagliate
   */
  export const getInvestmentDetails = async (symbol) => {
    try {
      const yahooSymbol = SYMBOL_MAP[symbol] || symbol;
      // Endpoint per i dettagli dell'investimento
      const url = `https://cors-anywhere.herokuapp.com/https://query1.finance.yahoo.com/v10/finance/quoteSummary/${yahooSymbol}?modules=assetProfile,summaryDetail,defaultKeyStatistics,price`;
      
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Errore API Yahoo Finance Details: ${response.status}`);
      }
      
      const data = await response.json();
      return processYahooDetails(data, symbol);
    } catch (error) {
      console.error(`Errore nel recupero dei dettagli per ${symbol}:`, error);
      // Ritorna i dettagli predefiniti in caso di errore
      return getDefaultInvestmentDetails(symbol);
    }
  };
  
  /**
   * Elabora i dettagli dell'investimento da Yahoo Finance
   * @param {Object} yahooData - Dati Yahoo Finance
   * @param {string} symbol - Simbolo dell'investimento
   * @returns {Object} Dettagli elaborati
   */
  function processYahooDetails(yahooData, symbol) {
    const result = yahooData.quoteSummary.result[0];
    
    // Estrai e formatta le informazioni pertinenti
    const details = {
      symbol: symbol,
      name: result.price?.shortName || '',
      currency: result.price?.currency || 'EUR',
      price: result.price?.regularMarketPrice?.raw || 0,
      change: result.price?.regularMarketChangePercent?.raw || 0,
      marketCap: result.summaryDetail?.marketCap?.raw || 0,
      volume: result.summaryDetail?.volume?.raw || 0,
      peRatio: result.summaryDetail?.trailingPE?.raw || 0,
      dividendYield: (result.summaryDetail?.dividendYield?.raw || 0) * 100,
      sector: result.assetProfile?.sector || '',
      industry: result.assetProfile?.industry || '',
      // Per ETF
      totalAssets: result.defaultKeyStatistics?.totalAssets?.raw || 0,
      ytdReturn: result.defaultKeyStatistics?.ytdReturn?.raw || 0,
      beta: result.defaultKeyStatistics?.beta?.raw || 0,
      expense: result.defaultKeyStatistics?.annualReportExpenseRatio?.raw || 0,
    };
    
    return details;
  }
  
  // ----- DATI SIMULATI DI FALLBACK -----
  
  /**
   * Genera dati di performance simulati
   * @param {string} investmentId - ID dell'investimento
   * @param {string} timeRange - Intervallo temporale
   * @returns {Promise<Object>} Dati simulati per Chart.js
   */
  export const getMockPerformanceData = async (investmentId, timeRange) => {
    // Simula latenza di rete
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Genera date e prezzi di esempio basati su investmentId e timeRange
    let startDate, endDate = new Date();
    let pointCount;
    
    switch(timeRange) {
      case '1M':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        pointCount = 30;
        break;
      case '3M':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        pointCount = 90;
        break;
      case '1Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        pointCount = 365;
        break;
      case '5Y':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 5);
        pointCount = 60; // Dati mensili
        break;
      case 'MAX':
        startDate = new Date('2010-01-01');
        pointCount = 180; // Dati trimestrali
        break;
      default:
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        pointCount = 365;
    }
  
    // Genera date tra startDate e endDate
    const dates = [];
    const msInDay = 24 * 60 * 60 * 1000;
    const dayStep = Math.ceil((endDate - startDate) / (pointCount * msInDay));
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + dayStep)) {
      dates.push(new Date(d));
    }
  
    // Genera valori di prezzo in base all'ID dell'investimento
    let basePrice;
    let volatility;
    let trend;
    let benchmarkTrend;
    let benchmarkVolatility;
    
    // Diversi comportamenti per diversi ID
    switch(investmentId) {
      case 'VWCE':
        basePrice = 100;
        volatility = 0.015;
        trend = 0.0002;
        benchmarkTrend = 0.00018;
        benchmarkVolatility = 0.012;
        break;
      case 'SWDA':
        basePrice = 80;
        volatility = 0.018;
        trend = 0.00018;
        benchmarkTrend = 0.00016;
        benchmarkVolatility = 0.014;
        break;
      case 'AGGH':
        basePrice = 50;
        volatility = 0.005;
        trend = 0.00005;
        benchmarkTrend = 0.00007;
        benchmarkVolatility = 0.004;
        break;
      case 'ENEL':
        basePrice = 7;
        volatility = 0.025;
        trend = -0.0001;
        benchmarkTrend = 0.0001;
        benchmarkVolatility = 0.015;
        break;
      case 'ISP': // Intesa Sanpaolo
        basePrice = 3;
        volatility = 0.022;
        trend = 0.0003;
        benchmarkTrend = 0.0002;
        benchmarkVolatility = 0.016;
        break;
      default:
        basePrice = 50;
        volatility = 0.02;
        trend = 0.0001;
        benchmarkTrend = 0.00015;
        benchmarkVolatility = 0.015;
    }
  
    // Genera prezzi con trend e volatilità
    let currentPrice = basePrice;
    const prices = dates.map((date, index) => {
      // Aggiungi trend e volatilità casuale
      currentPrice *= (1 + trend + (Math.random() - 0.5) * volatility);
      return currentPrice;
    });
  
    // Genera prezzi benchmark
    let benchmarkPrice = basePrice;
    const benchmarkPrices = dates.map((date, index) => {
      // Aggiungi trend e volatilità casuale
      benchmarkPrice *= (1 + benchmarkTrend + (Math.random() - 0.5) * benchmarkVolatility);
      return benchmarkPrice;
    });
  
    // Ritorna dati formattati per Chart.js
    return {
      labels: dates,
      datasets: [
        {
          label: investmentId,
          data: prices,
          borderColor: '#1e3a8a',
          backgroundColor: 'rgba(30, 58, 138, 0.1)',
          borderWidth: 2,
          tension: 0.1,
          fill: true,
          pointRadius: 0, // Nasconde i punti per rendere il grafico più pulito
        },
        {
          label: 'Benchmark',
          data: benchmarkPrices,
          borderColor: '#FF6384',
          borderDash: [5, 5],
          borderWidth: 2,
          tension: 0.1,
          fill: false,
          pointRadius: 0,
        }
      ],
    };
  };
  
  /**
   * Dettagli statici di investimenti per fallback
   * @param {string} symbol - Simbolo dell'investimento
   * @returns {Object} Dettagli predefiniti
   */
  function getDefaultInvestmentDetails(symbol) {
    const detailsMap = {
      'VWCE': {
        symbol: 'VWCE',
        name: 'Vanguard FTSE All-World UCITS ETF',
        isin: 'IE00BK5BQT80',
        category: 'Azionari Internazionali Large Cap Blend',
        expense: 0.22,
        ytdReturn: 5.8,
        rating: '★★★★☆',
        ter: 0.22,
        currency: 'USD',
        aum: '6,23 miliardi USD'
      },
      'SWDA': {
        symbol: 'SWDA',
        name: 'iShares Core MSCI World UCITS ETF',
        isin: 'IE00B4L5Y983',
        category: 'Azionari Internazionali Large Cap Blend',
        expense: 0.20,
        ytdReturn: 4.2,
        rating: '★★★★★',
        ter: 0.20,
        currency: 'USD',
        aum: '52,1 miliardi USD'
      },
      'AGGH': {
        symbol: 'AGGH',
        name: 'iShares Core Global Aggregate Bond UCITS ETF',
        isin: 'IE00BDBRDM35',
        category: 'Obbligazionari Globali Large Cap',
        expense: 0.10,
        ytdReturn: -0.8,
        rating: '★★★☆☆',
        ter: 0.10,
        currency: 'USD',
        aum: '4,15 miliardi USD'
      },
      'ISP': {
        symbol: 'ISP',
        name: 'Intesa Sanpaolo',
        isin: 'IT0000072618',
        index: 'FTSE MIB',
        sector: 'Bancario',
        ytdReturn: 12.4,
        peRatio: 8.37,
        dividendYield: 7.21,
        marketCap: '52,4 miliardi EUR',
        pbRatio: 0.76
      },
      'ENEL': {
        symbol: 'ENEL',
        name: 'Enel SpA',
        isin: 'IT0003128367',
        index: 'FTSE MIB',
        sector: 'Utilities',
        ytdReturn: 3.2,
        peRatio: 11.24,
        dividendYield: 5.78,
        marketCap: '68,2 miliardi EUR',
        pbRatio: 1.87
      }
    };
    
    return detailsMap[symbol] || {
      symbol: symbol,
      name: `${symbol} (dati non disponibili)`,
      ytdReturn: 0,
      currency: 'EUR'
    };
  }
  