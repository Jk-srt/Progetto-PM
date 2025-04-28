import Holidays from 'date-holidays';
const hd = new Holidays('US');
const API_BASE = 'http://localhost:5000';

export async function fetchHistoricalData(symbol, timeframe) {
  console.log('Fetching historical data for symbol:', symbol, 'and timeframe:', timeframe);
    const url = `${API_BASE}/api/yahoo/historical?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Errore nel recupero dei dati storici');
    return await res.json();
}

export async function fetchListingStatus(query = '') {
    const url = `${API_BASE}/api/yahoo/listing?query=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Errore nella ricerca dei simboli');
    const data = await res.json();
    console.log('Listing status response:', data);
    return data;
}

export async function fetchRealTimeQuote(symbol) {
    const url = `${API_BASE}/api/yahoo/realtime?symbol=${encodeURIComponent(symbol)}`;
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error('Errore nel recupero del quote in tempo reale');
    return await res.json();
}
export async function fetchQuoteOnADate(symbol, date) {
    const url = `${API_BASE}/api/yahoo/quote?symbol=${encodeURIComponent(symbol)}&date=${encodeURIComponent(date)}`;
    const res = await fetch(url);
    if (!res.ok) {
        if (res.status === 404) {
            console.log('The requested date might be a holiday or market closed. Fetching the closest available data before the given date.');
            const fallbackUrl = `${API_BASE}/api/yahoo/quote/closest?symbol=${encodeURIComponent(symbol)}&date=${encodeURIComponent(date)}`;
            const fallbackRes = await fetch(fallbackUrl);
            if (!fallbackRes.ok) throw new Error('Errore nel recupero del quote più vicino alla data specificata');
            const fallbackData = await fallbackRes.json();
            console.log('Closest available data response:', fallbackData);
            return fallbackData;
        }
        throw new Error('Errore nel recupero del quote in tempo reale');
    }
    const data = await res.json();
    console.log('Quote on the requested date response:', data);
    return data;
}

// trova la data di trading valida più vicina ≤ requestedDate
function findPrevTradingDate(dateStr) {
  const d = new Date(dateStr);
  while (d.getDay() === 0 || d.getDay() === 6 || hd.isHoliday(d)) {
    d.setDate(d.getDate() - 1);
  }
  return d.toISOString().slice(0,10);
}

export async function fetchQuoteOnNearestTradingDate(symbol, date) {
  const validDate = findPrevTradingDate(date);
  return fetchQuoteOnADate(symbol, validDate);
}
