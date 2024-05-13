import React, { useState, useEffect } from 'react';
import NewsDataService from '../services/news';
import './NewsPage.css';

const BusinessNews = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState({});
  const [apiError, setApiError] = useState(null);

  const fetchTopStories = async () => {
    const companies = ['AAPL', 'GOOG', 'MSFT', 'AMZN', 'META'];
    const promises = companies.map(company => NewsDataService.getNewsDataAddStock(company));
    try {
      const companyData = await Promise.all(promises);
      const topStories = {};
      companyData.forEach((data, index) => {
        topStories[companies[index]] = data.feed.slice(0, 6); // Store top 6 stories for each company
      });
      setStockData(topStories);
    } catch (error) {
      console.error('Error fetching top stories:', error);
      setApiError('No API calls'); // Change error message to indicate no API calls
    }
  };

  const handleSearch = async () => {
    if (symbol.trim() !== '') {
      try {
        const rawStockData = await NewsDataService.getNewsDataAddStock(symbol);
        setStockData({ [symbol]: rawStockData.feed });
      } catch (error) {
        console.error(`Error fetching news data for symbol ${symbol}:`, error);
        setApiError('No API calls'); // Error message to indicate no API calls
      }
    }
  };

  // erase stock data and error message after symbol change
  useEffect(() => {
    fetchTopStories();
    setApiError(null);
  }, []);

  return (
    <div className="news-page-container">
      <label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="search-bar"
          placeholder="Enter stock symbol..."
        />
      </label>
      <button onClick={handleSearch}>Search</button>

      {apiError ? (
        <div className="error-message">{apiError}</div>
      ) : (
        <div>
          <h1>Stock News</h1>
          <p style={{ fontSize: '20px' }}>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {Object.keys(stockData).map((companySymbol, index) => (
            <div key={index}>
              <h2>Top Stories for {companySymbol}</h2>
              <div className="card-deck">
                {stockData[companySymbol].map((item, itemIndex) => (
                  <div key={itemIndex} className="card">
                    <a href={item.url}>
                      <img className="card-img-top" src={item.banner_image} alt="Banner" style={{ height: '200px', objectFit: 'cover' }} />
                    </a>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <p className="card-source">{item.source}</p>
                        <h5 className="card-title">{item.title}</h5>
                        <p className="card-text">{item.summary}</p>
                        <a href={item.url} className="btn btn-primary">Read More</a>
                      </div>
                      <div>
                        <hr />
                        <p className="author-name">Author: {item.authors[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessNews;