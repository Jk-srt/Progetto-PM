const express = require('express');
const router = express.Router();

// Mock stock data for common tickers
const mockStocks = {
    'AAPL': { name: 'Apple Inc.', price: 189.84, change: 1.23, changePercent: 0.65 },
    'MSFT': { name: 'Microsoft Corporation', price: 415.50, change: -2.10, changePercent: -0.50 },
    'AMZN': { name: 'Amazon.com Inc.', price: 178.08, change: 0.89, changePercent: 0.50 },
    'GOOG': { name: 'Alphabet Inc.', price: 174.48, change: 1.56, changePercent: 0.90 },
    'META': { name: 'Meta Platforms Inc.', price: 489.17, change: -1.20, changePercent: -0.24 },
    'TSLA': { name: 'Tesla, Inc.', price: 172.63, change: -3.22, changePercent: -1.83 },
    'NVDA': { name: 'NVIDIA Corporation', price: 950.02, change: 15.30, changePercent: 1.64 },
    'BRK.B': { name: 'Berkshire Hathaway Inc.', price: 428.45, change: 0.45, changePercent: 0.11 },
    'JPM': { name: 'JPMorgan Chase & Co.', price: 197.28, change: 0.76, changePercent: 0.39 },
    'JNJ': { name: 'Johnson & Johnson', price: 152.30, change: -0.35, changePercent: -0.23 },
    'V': { name: 'Visa Inc.', price: 273.60, change: 1.10, changePercent: 0.40 },
    'PG': { name: 'Procter & Gamble Co.', price: 165.38, change: 0.28, changePercent: 0.17 },
    'UNH': { name: 'UnitedHealth Group Inc.', price: 526.78, change: 3.21, changePercent: 0.61 },
    'HD': { name: 'Home Depot Inc.', price: 342.75, change: -1.50, changePercent: -0.44 },
    'MA': { name: 'Mastercard Inc.', price: 458.18, change: 2.35, changePercent: 0.52 },
    'NFLX': { name: 'Netflix, Inc.', price: 636.66, change: 7.58, changePercent: 1.21 },
    'DIS': { name: 'Walt Disney Co.', price: 98.39, change: 0.45, changePercent: 0.46 },
    'INTC': { name: 'Intel Corporation', price: 34.26, change: -0.18, changePercent: -0.52 },
    'VZ': { name: 'Verizon Communications Inc.', price: 39.89, change: 0.32, changePercent: 0.81 },
    'KO': { name: 'Coca-Cola Co.', price: 62.30, change: 0.14, changePercent: 0.23 },
    'PEP': { name: 'PepsiCo, Inc.', price: 171.48, change: 0.38, changePercent: 0.22 },
    'WMT': { name: 'Walmart Inc.', price: 67.21, change: 0.33, changePercent: 0.49 },
    'BAC': { name: 'Bank of America Corp.', price: 38.75, change: 0.15, changePercent: 0.39 },
    'CSCO': { name: 'Cisco Systems, Inc.', price: 49.37, change: -0.21, changePercent: -0.42 },
    'ADBE': { name: 'Adobe Inc.', price: 519.96, change: 5.24, changePercent: 1.02 },
    'CRM': { name: 'Salesforce, Inc.', price: 275.55, change: 2.15, changePercent: 0.79 },
    'XOM': { name: 'Exxon Mobil Corporation', price: 114.16, change: -0.57, changePercent: -0.50 },
    'NKE': { name: 'Nike, Inc.', price: 95.81, change: 0.73, changePercent: 0.77 },
    'MCD': { name: "McDonald's Corporation", price: 272.27, change: 1.05, changePercent: 0.39 },
    'ABT': { name: 'Abbott Laboratories', price: 112.42, change: -0.18, changePercent: -0.16 },
    'APP': { name: 'AppLovin Corporation', price: 79.24, change: 1.22, changePercent: 1.56 },
};

// Helper function to generate a price for stocks not in our mockStocks
const generatePriceForSymbol = (symbol) => {
    // Use the sum of character codes to generate a price between 10 and 1000
    let sum = 0;
    for (let i = 0; i < symbol.length; i++) {
        sum += symbol.charCodeAt(i);
    }
    const basePrice = (sum % 990 + 10);
    
    // Add some randomness for change values
    const change = ((Math.random() * 2) - 1) * (basePrice * 0.02); // +/- 2% price change
    
    return {
        name: `${symbol} Stock`,
        price: parseFloat(basePrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat((change / basePrice * 100).toFixed(2))
    };
};

// Get current quote for a symbol
router.get('/quote/:symbol', (req, res) => {
    const { symbol } = req.params;
    const upperSymbol = symbol.toUpperCase();
    
    // Get stock from mock data or generate if not found
    const stock = mockStocks[upperSymbol] || generatePriceForSymbol(upperSymbol);
    
    // Add small random fluctuation to make it look more realistic on frequent refreshes
    const fluctuation = (Math.random() * 0.006) - 0.003; // +/- 0.3% fluctuation
    const updatedPrice = parseFloat((stock.price * (1 + fluctuation)).toFixed(2));
    const priceChange = parseFloat((updatedPrice - stock.price).toFixed(2));
    const percentChange = parseFloat((priceChange / stock.price * 100).toFixed(2));
    
    const response = {
        symbol: upperSymbol,
        price: updatedPrice,
        change: stock.change + priceChange,
        changePercent: stock.changePercent + percentChange,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        timestamp: new Date().toISOString(),
        __mocked: true  // Flag to indicate this is mock data
    };
    
    res.json(response);
});

// Get historical data for a symbol
router.get('/historical/:symbol', (req, res) => {
    const { symbol } = req.params;
    const period = req.query.period || '1y';
    
    const upperSymbol = symbol.toUpperCase();
    const stock = mockStocks[upperSymbol] || generatePriceForSymbol(upperSymbol);
    
    // Generate historical data points
    const dataPoints = 60; // number of data points to generate
    const prices = [];
    const timestamps = [];
    
    // Current date
    const endDate = new Date();
    
    // Determine period in days
    let periodDays = 365;
    if (period === '1w') periodDays = 7;
    else if (period === '1m') periodDays = 30;
    else if (period === '3m') periodDays = 90;
    else if (period === '6m') periodDays = 180;
    else if (period === '5y') periodDays = 1825;
    
    // Generate data points
    const startPrice = stock.price * 0.7; // Start 30% lower than current price
    const trend = 0.3 / periodDays; // Positive trend over the period
    
    for (let i = 0; i < dataPoints; i++) {
        // Calculate timestamp
        const date = new Date(endDate);
        date.setDate(date.getDate() - Math.floor(periodDays * (1 - i/dataPoints)));
        timestamps.push(date.toISOString().split('T')[0]);
        
        // Calculate price with trend and noise
        const progress = i / dataPoints;
        const trendComponent = startPrice * (1 + trend * progress * dataPoints);
        const noiseComponent = (Math.random() * 0.1 - 0.05) * startPrice; // +/- 5% noise
        const price = parseFloat((trendComponent + noiseComponent).toFixed(2));
        prices.push(price);
    }
    
    res.json({ 
        symbol: upperSymbol,
        prices, 
        timestamps,
        __mocked: true
    });
});

// Get quote on specific date or nearest trading day
router.get('/historical/:symbol/date/:date', (req, res) => {
    const { symbol, date } = req.params;
    const upperSymbol = symbol.toUpperCase();
    
    // Get stock from mock data or generate if not found
    const stock = mockStocks[upperSymbol] || generatePriceForSymbol(upperSymbol);
    
    // Calculate a historical price (use 90% of current price for simplicity)
    const historicalPrice = parseFloat((stock.price * 0.9).toFixed(2));
    
    res.json({
        symbol: upperSymbol,
        date: date,
        price: historicalPrice,
        __mocked: true
    });
});

module.exports = router;
