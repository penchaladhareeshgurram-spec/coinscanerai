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
        const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        const data = await res.json();
        if (data && Array.isArray(data.Data)) {
          setNews(data.Data.slice(0, 15));
        } else if (data && data.Data && Array.isArray(data.Data.Data)) {
          // Sometimes APIs wrap it differently
          setNews(data.Data.Data.slice(0, 15));
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
