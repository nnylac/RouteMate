import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [origin, setOrigin] = useState('SMU');
  const [destination, setDestination] = useState('Changi');
  const [sortBy, setSortBy] = useState<'price' | 'eta'>('price');
  const [results, setResults] = useState<any>(null);

  const fetchRides = async () => {
    try {
      // Note: We point to PORT 3008 (Aggregator)
      const response = await axios.post(`http://localhost:3008/ridehail/quotes?sortBy=${sortBy}`, {
        origin,
        destination,
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching rides:", error);
      alert("Make sure Aggregator (3008) is running!");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>DRAFT UI - FOR TESTING ONLY</h1>
      <h1>🚖 RideHailing UI</h1>
      
      <div style={{ marginBottom: '10px' }}>
        <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origin" />
        <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" />
        
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'price' | 'eta')}>
          <option value="price">Cheapest First</option>
          <option value="eta">Fastest First</option>
        </select>
        
        <button onClick={fetchRides}>Search</button>
      </div>

      <hr />

      {results && (
        <div>
          <h3>Results:</h3>
          <ul>
            {results.quotes.map((quote: any, index: number) => (
              <li key={index} style={{ color: index === 0 ? 'green' : 'black' }}>
                <strong>{quote.provider}</strong> - ${quote.price} ({quote.eta} mins)
                {index === 0 && " ⭐ BEST MATCH"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;