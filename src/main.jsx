import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// React 18+ automatic batching and R3F v8+ usually handle context restore.
// However, strictly cleaning up resources is key.
createRoot(document.getElementById('root')).render(
  <App />,
)