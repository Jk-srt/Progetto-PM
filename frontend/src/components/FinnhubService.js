export async function fetchMarketNews(category = 'general', count = 30, keyword = '') {
    let url = `/api/news/financial?category=${category}&count=${count}`;
    if (keyword && keyword.trim() !== '') {
        url += `&q=${encodeURIComponent(keyword)}`;
    }
    console.log('[fetchMarketNews] URL chiamata:', url);

    const res = await fetch(url);
    console.log('[fetchMarketNews] Status risposta:', res.status);

    if (!res.ok) throw new Error('Errore caricamento notizie');
    const json = await res.json();
    console.log('[fetchMarketNews] Dati ricevuti:', json);
    return json;
}
