const apiKey = process.env.REACT_APP_STOCK_API_KEY;

class NewsDataService {
  async getNewsDataAddStock (symbol) {
    console.log('debug print');
    let url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      console.log(response);
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error(`Error fetching news for symbol ${symbol}:`, error);
      throw error; // Rethrow the error for handling in the calling code
    }
  }

}

export default new NewsDataService();