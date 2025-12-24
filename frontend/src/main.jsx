import AuthProvider from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import "./App.css"
import AuthContext from './context/AuthContext.jsx'



createRoot(document.getElementById('root')).render(
  <ThemeProvider>
  <AuthProvider>
    
    
      <App />
    
  </AuthProvider>,
  </ThemeProvider>
  
);
