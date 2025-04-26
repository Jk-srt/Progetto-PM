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
    const res = await fetch(url);
    if (!res.ok) throw new Error('Errore nel recupero del quote in tempo reale');
    return await res.json();
}
