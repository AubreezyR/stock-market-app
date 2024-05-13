import React, { useState, useEffect } from 'react'; // Importing React and hooks for state and side effects
import StockDataService from '../services/stock-services'; // Importing service for fetching stock data
import { useAuth } from './AuthContext'; // Importing authentication context hook
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Importing components from recharts library for rendering line chart
import './AddStock.css'; // Importing CSS for styling

const Dashboard = () => { // Functional component definition
  const [stocks, setStocks] = useState([]); // State hook for storing stock data
  const [error, setError] = useState(null); // State hook for handling errors
  const auth = useAuth(); // Authentication context hook
  const [selectedStockType, setSelectedStockType] = useState(null); // State hook for selected stock type

  useEffect(() => { // Side effect hook for fetching stock data when user and selected stock type change
    if (auth.user) {
      fetchStocks(auth.user.uid, selectedStockType);
    }
  }, [auth.user, selectedStockType]);

  const fetchStocks = async (userId, stockType) => { // Function to fetch stock data asynchronously
    try {
      const stocksData = await StockDataService.fetchStocks(userId, stockType); // Fetching stock data from the service
      if (stocksData && stocksData.length > 0) { // If stock data is available
        setStocks(stocksData); // Update stocks state with fetched data
      } else {
        //setError("No stocks available."); // Set error message if no stocks are available (currently commented out)
      }
    } catch (error) { // Catching and handling errors during fetching
      console.error("Error fetching stocks:", error); // Logging error to console
      setError("Failed to fetch stocks. Please try again later."); // Setting error message
    }
  };

  const renderStockGraphs = () => { // Function to render stock graphs based on fetched data
    try {
      if (!stocks || stocks.length === 0) return null; // Return null if stocks data is empty

      return stocks.map((stock, index) => { // Mapping over each stock to render individual graphs
        const formattedStockData = formatStockData(stock); // Formatting stock data for rendering

        if (formattedStockData.length === 0) { // If formatted data is empty, skip rendering
          return null;
        }

        const lastHigh = formattedStockData[formattedStockData.length - 1].high; // Getting the last high value
        const totalValue = lastHigh * stock.sharesOwned; // Calculating total value of the stock
        const maxHigh = Math.max(...formattedStockData.map(data => data.high)); // Calculate the maximum 'high' value

        return (
          <div key={index} className="stock-container"> {/* Rendering container for each stock */}
            <div className="stock-graph"> {/* Rendering graph section */}
              <h3>{stock.company}</h3> {/* Displaying company name */}
              <ResponsiveContainer width="100%" height={400}> {/* Responsive container for chart */}
                <LineChart
                  data={formattedStockData}
                  margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" /> {/* Grid lines for chart */}
                  <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} /> {/* X-axis with date labels */}
                  <YAxis domain={[0, maxHigh]} /> {/* Y-axis */}
                  <Tooltip /> {/* Tooltip for displaying data on hover */}
                  <Legend /> {/* Legend for chart */}
                  <Line type="monotone" dataKey="high" stroke="#8884d8" dot={false} /> {/* Line for high values */}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="stock-info"> {/* Rendering stock information section */}
              <label htmlFor={`shares-input-${index}`}>Enter Number of Shares:</label> {/* Label for input */}
              <input 
                type="number"
                id={`shares-input-${index}`}
                value={stock.sharesOwned}
                onChange={(e) => handleSharesChange(index, e.target.value)} /* Handling change in number of shares owned */
              />
              <p>Total Value: ${totalValue.toFixed(2)}</p> {/* Displaying total value of the stock */}
            </div>
          </div>
        );
      });
    } catch (error) { // Catching and handling errors during rendering
      return (
        <div className="error-message"> {/* Rendering error message if an error occurs */}
          Error: {error.message}
        </div>
      );
    }
  };

  const handleSharesChange = (index, value) => { // Function to handle change in number of shares owned
    const updatedStocks = [...stocks]; // Creating a copy of stocks array
    updatedStocks[index].sharesOwned = value; // Updating shares owned for the specific stock
    setStocks(updatedStocks); // Updating stocks state with the modified array
  };

  const formatStockData = (stock) => { // Function to format stock data for rendering
    try {
      return stock.dates.map((date, index) => { // Mapping over dates and highs to format data
        return { 
          date: new Date(date),
          high: stock.highs[index]
        };
      }).sort((a, b) => a.date - b.date); // Sorting formatted data by date
    } catch (error) { // Catching and handling errors during formatting
      setError("Error parsing stock data: " + error.message); // Setting error message
      return []; // Returning empty array
    }
  };

  const handleButtonClick = (type) => { // Function to handle button click for selecting stock type
    setSelectedStockType(type); // Setting selected stock type
  };

  return (
    <div className="dashboard-container"> {/* Main container for dashboard */}
      <h2>Dashboard</h2> {/* Heading for dashboard */}
      <div className="button-container"> {/* Container for buttons to select stock type */}
        {['intraday', 'day', 'week', 'month'].map(type => { // Mapping over stock types to render buttons
          return (
            <button key={type} onClick={() => handleButtonClick(type)} className={`button ${selectedStockType === type ? 'active' : ''}`}>{type}</button> /* Button for each stock type */
          );
        })}
      </div>
      <div className="stocks-chart"> {/* Container for rendering stock graphs */}
        {renderStockGraphs()} {/* Rendering stock graphs */}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Rendering error message if error state is not null */}
    </div>
  );
};

export default Dashboard; // Exporting Dashboard component
