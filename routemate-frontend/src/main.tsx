import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { CardProvider } from './context/CardContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CardProvider>
        <App />
      </CardProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
