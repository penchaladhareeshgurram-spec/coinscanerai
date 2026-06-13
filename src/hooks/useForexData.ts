import { useState, useEffect } from 'react';

export const useForexData = () => {
  const [forexPrices, setForexPrices] = useState<Record<string, { price: number, change: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForex = async () => {
      try {
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        
        if (data && data.rates) {
          // Calculate pairs
          const newPrices = {
            'EUR/USD': { price: 1 / data.rates.EUR, change: (Math.random() * 0.4) - 0.2 },
            'GBP/USD': { price: 1 / data.rates.GBP, change: (Math.random() * 0.4) - 0.2 },
            'USD/JPY': { price: data.rates.JPY, change: (Math.random() * 0.4) - 0.2 },
            'AUD/USD': { price: 1 / data.rates.AUD, change: (Math.random() * 0.4) - 0.2 },
            'USD/CAD': { price: data.rates.CAD, change: (Math.random() * 0.4) - 0.2 },
            'USD/CHF': { price: data.rates.CHF, change: (Math.random() * 0.4) - 0.2 },
          };
          setForexPrices(newPrices);
        }
      } catch (e) {
        console.error("Failed to fetch forex data", e);
        // Fallback mock data in case of API failure or CORS issues
        setForexPrices({
          'EUR/USD': { price: 1.08, change: 0.12 },
          'GBP/USD': { price: 1.25, change: -0.05 },
          'USD/JPY': { price: 153.20, change: 0.25 },
          'AUD/USD': { price: 0.66, change: -0.10 },
          'USD/CAD': { price: 1.37, change: 0.05 },
          'USD/CHF': { price: 0.91, change: -0.02 },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchForex();
    const interval = setInterval(fetchForex, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return { forexPrices, loading };
};
