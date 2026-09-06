import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

// Global window error listener for unhandled exceptions
window.addEventListener('error', (e) => {
  console.error("CarsApp Global Error:", e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error("CarsApp Unhandled Promise Rejection:", e.reason);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

