import { useState, useEffect } from 'react';

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  published_on: number;
  imageurl: string;
}

export const useMarketNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://newsdata.io/api/1/news?apikey=tpub_a48c6030e25b4263bdd98e8fbcf2f67c&q=crypto%20OR%20forex&language=en');
        const data = await res.json();
        
        if (data && data.status === 'success' && Array.isArray(data.results)) {
          const mappedNews = data.results.slice(0, 15).map((article: any) => ({
            id: article.article_id || Math.random().toString(),
            title: article.title,
            url: article.link,
            source: article.source_name || article.source_id || 'News',
            published_on: new Date(article.pubDate).getTime() / 1000,
            imageurl: article.image_url || ''
          }));
          setNews(mappedNews);
        } else {
          console.warn("Unexpected news API response format:", data);
        }
      } catch (e) {
        console.error("Failed to fetch news", e);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 120000); // Update every 2 minutes
    return () => clearInterval(interval);
  }, []);

  return { news, loading };
};
