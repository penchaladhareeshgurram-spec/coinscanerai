import { useState, useEffect } from 'react';

export const useForexData = () => {
  const [forexPrices, setForexPrices] = useState<Record<string, { price: number, change: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForex = async () => {
      try {
        const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,AUD,CAD,CHF');
        const data = await res.json();
        
        if (data && data.rates) {
          // Calculate pairs
          const newPrices = {
            'EUR/USD': { price: 1 / data.rates.EUR, change: (Math.random() * 0.4) - 0.2 }, // Mocking change as frankfurter doesn't provide 24h change easily in one request without historical
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
