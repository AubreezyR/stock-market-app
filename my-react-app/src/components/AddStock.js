import React, { useState, useEffect } from 'react'; // Import React and necessary hooks
import StockDataService from '../services/stock-services'; // Import custom StockDataService module
import { useAuth } from './AuthContext'; // Import useAuth hook from AuthContext module
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Import necessary components from recharts library
import './AddStock.css'; // Import custom CSS for styling

// Define AddStock functional component
const AddStock = () => {
  // Define state variables using useState hook
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [interval, setInterval] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null); // State to track selected button
  const auth = useAuth(); // Access authentication context using useAuth hook
  const [error, setError] = useState(null); // State for error handling

  // useEffect hook to fetch top stocks data on component mount
  useEffect(() => {
    // Define async function to fetch top stocks data
    const fetchTopStocks = async () => {
      try {
        // Array of top stock symbols
        const topStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'];
        // Array of promises to fetch data for each top stock
        const promises = topStocks.map(symbol => StockDataService.getStockData(symbol, 'day'));
        // Wait for all promises to resolve and store data in 'data'
        const data = await Promise.all(promises);
        // Set stockData state variable with fetched data
        setStockData(data);
        // Set interval state variable to 'day'
        setInterval('day');
      } catch (error) {
        // Handle errors by setting error state variable
        setError(error.message);
      }
    };

    // Call fetchTopStocks function
    fetchTopStocks();
  }, []); // Empty dependency array ensures useEffect runs only on component mount

  // Function to handle fetching stock data based on selected interval
  const handleGetStockData = async (interval) => {
    try {
      // Validate if symbol is provided
      if (!symbol) {
        setError("Please enter a valid stock symbol.");
        return;
      }
      // Set selected button state variable
      setSelectedButton(interval);
      // Fetch stock data for the provided symbol and interval
      const data = await StockDataService.getStockData(symbol, interval);
      // Validate fetched data
      if (data && data['Meta Data'] && data['Meta Data']['2. Symbol']) {
        // Set stockData state variable with fetched data
        setStockData([data]);
        // Set interval state variable
        setInterval(interval);
      } else {
        // Throw error for invalid or unavailable stock symbol
        throw new Error("Invalid or unavailable stock symbol.");
      }
    } catch (error) {
      // Handle errors by setting error state variable
      setError(error.message);
    }
  };

// Function to render stock graphs based on fetched data
const renderStockGraphs = () => {
  try {
    // Return null if no stock data available
    if (!stockData || stockData.length === 0) return null;

    // Map through stockData array and render graph for each stock
    return stockData.map((stock, index) => (
      <div key={index} className="stock-graph">
        <h3>{stock['Meta Data']['2. Symbol']}</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={formatStockData(stock)} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="high" stroke="#8884d8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ));
  } catch (error) {
    // Handle chart generation error
    return (
      <div className="error-message">
        Error: Out Of API Calls
      </div>
    );
  }
};


  // Function to format stock data for rendering
  const formatStockData = (stock) => {
    try {
      // Determine time series key based on interval
      const timeSeriesKey = interval === 'day' ? 'Time Series (Daily)' :
                              interval === 'week' ? 'Weekly Time Series' :
                              interval === 'month' ? 'Monthly Time Series' :
                              interval === 'intraday' ? 'Time Series (5min)' : '';
      // Extract time series data from stock object
      const timeSeries = stock[timeSeriesKey];
      // Format and return data for rendering
      return Object.keys(timeSeries).map(date => ({
        date: new Date(date).toISOString().split('T')[0],
        high: parseFloat(timeSeries[date]['2. high'])
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      // Handle errors by setting error state variable
      setError("Error parsing API response: " + error.message);
      return [];
    }
  };

  // Function to handle saving stock data
  const handleSaveStock = async () => {
    try {
      // Validate if stock data and interval are available
      if (!stockData || !interval) {
        throw new Error("Stock data or interval is not available.");
      }
      
      // Determine time series key based on interval
      const timeSeriesKey = interval === 'day' ? 'Time Series (Daily)' :
                             interval === 'week' ? 'Weekly Time Series' :
                             interval === 'month' ? 'Monthly Time Series' :
                             interval === 'intraday' ? 'Time Series (5min)' : '';
      
      // Extract time series data and meta data from stockData
      const timeSeries = stockData[0][timeSeriesKey];
      const metaData = stockData[0]['Meta Data'];
      const company = metaData['2. Symbol'];
      
      // Extract dates and highs from time series data
      const dates = Object.keys(timeSeries).slice(0, 100);
      const highs = Object.values(timeSeries).slice(0, 100).map(data => data['2. high']);
      
      // Check if user is authenticated
      if (auth.user) {
        // Fetch existing stock data for the user
        const existingStock = await StockDataService.getStockByCompany(auth.user.uid, company);
        
        // Update or add stock data based on existence
        if (existingStock) {
          // Update existing stock
          await StockDataService.updateStock(auth.user.uid, existingStock.id, dates, highs, interval);
          console.log("Existing stock updated successfully!");
        } else {
          // Add new stock
          await StockDataService.addStockToUser(auth.user.uid, company, dates, highs, interval);
          console.log("New stock added to user successfully!");
        }
        
        // Reset states and clear error
        setError(null);
        setStockData(null);
        setSymbol('');
        setInterval(null);
      } else {
        // Throw error if user is not authenticated
        throw new Error("User not authenticated.");
      }
    } catch (error) {
      // Handle errors by setting error state variable
      setError(error.message);
    }
  };
  

  // Return JSX for AddStock component
  return (
    <div className="add-stock-container">
      <label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="search-bar"
          placeholder="Enter stock symbol..."
        />
      </label>
      <div className="button-container">
        {/* Buttons to select interval and save stock data */}
        <button onClick={() => handleGetStockData('intraday')} className={`button ${selectedButton === 'intraday' ? 'active' : ''}`}>Intraday</button>
        <button onClick={() => handleGetStockData('day')} className={`button ${selectedButton === 'day' ? 'active' : ''}`}>Day</button>
        <button onClick={() => handleGetStockData('week')} className={`button ${selectedButton === 'week' ? 'active' : ''}`}>Week</button>
        <button onClick={() => handleGetStockData('month')} className={`button ${selectedButton === 'month' ? 'active' : ''}`}>Month</button>
        <button onClick={handleSaveStock} disabled={!interval} className="button">Save Stock</button>
      </div>

      {/* Render stock graphs */}
      {renderStockGraphs()}

      {/* Display error message if any */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

// Export AddStock component as default
export default AddStock;
