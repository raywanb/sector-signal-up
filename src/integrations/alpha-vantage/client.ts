const ALPHA_VANTAGE_API_KEY = "31LTQRVXIBDAU0RK";
const BASE_URL = 'https://www.alphavantage.co/query';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.error('Alpha Vantage API key is not set');
    throw new Error('API key is not configured');
  }

  try {
    console.log('Fetching stock quotes for symbols:', symbols);
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
        console.log(`Fetching data for ${symbol} from:`, url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Failed to fetch data for ${symbol}:`, response.status, response.statusText);
          throw new Error(`Failed to fetch data for ${symbol}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Received data for ${symbol}:`, data);
        
        if (data['Error Message']) {
          console.error(`API Error for ${symbol}:`, data['Error Message']);
          throw new Error(data['Error Message']);
        }

        const quote = data['Global Quote'];
        
        if (!quote) {
          console.error(`No quote data available for ${symbol}:`, data);
          throw new Error(`No data available for ${symbol}`);
        }

        const result = {
          symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        };
        
        console.log(`Processed quote for ${symbol}:`, result);
        return result;
      })
    );

    return quotes;
  } catch (error) {
    console.error('Error fetching stock quotes:', error);
    throw error;
  }
}; 