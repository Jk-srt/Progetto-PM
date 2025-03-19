/**
 * Nota: Yahoo Finance non espone direttamente una WebSocket API pubblica.
 * Questa classe simula un comportamento WebSocket usando polling regolare.
 * In un ambiente di produzione, dovresti considerare servizi finanziari 
 * che offrono vere API WebSocket o implementare il tuo server proxy.
 */
export class YahooFinanceSocket {
    constructor(symbols, onMessage) {
      this.symbols = symbols.map(s => s.toUpperCase());
      this.onMessage = onMessage;
      this.isConnected = false;
      this.pollingInterval = null;
      this.API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';
      this.SYMBOL_MAP = {
        'VWCE': 'VWCE.MI',
        'SWDA': 'SWDA.MI',
        'AGGH': 'AGGH.MI',
        'ISP': 'ISP.MI',
        'ENEL': 'ENEL.MI',
      };
    }
  
    connect() {
      if (this.isConnected) return;
      
      console.log('Connessione simulata WebSocket avviata');
      this.isConnected = true;
      
      // Simuliamo la connessione WebSocket con polling frequente
      this.pollingInterval = setInterval(() => {
        this.symbols.forEach(symbol => {
          this.fetchLatestPrice(symbol);
        });
      }, 5000); // Polling ogni 5 secondi
      
      // Simula evento onopen
      setTimeout(() => {
        console.log('WebSocket connesso (simulato)');
      }, 500);
    }
    
    async fetchLatestPrice(symbol) {
      try {
        const yahooSymbol = this.SYMBOL_MAP[symbol] || symbol;
        
        // Usa un proxy per evitare problemi CORS
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const url = `${proxyUrl}${this.API_BASE_URL}${yahooSymbol}?interval=1m&range=1d`;
        
        const response = await fetch(url, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result.length > 0) {
          const result = data.chart.result[0];
          const lastIndex = result.timestamp.length - 1;
          
          if (lastIndex >= 0) {
            const price = result.indicators.quote[0].close[lastIndex];
            const timestamp = new Date(result.timestamp[lastIndex] * 1000);
            
            // Invia messaggio tramite callback onMessage
            if (this.onMessage && price !== null) {
              this.onMessage({
                symbol: symbol,
                price: price,
                timestamp: timestamp,
                type: 'price_update'
              });
            }
          }
        }
      } catch (error) {
        console.error(`Errore nel recupero del prezzo per ${symbol}:`, error);
      }
    }
    
    disconnect() {
      if (!this.isConnected) return;
      
      console.log('Disconnessione WebSocket (simulata)');
      this.isConnected = false;
      
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    }
  }
  