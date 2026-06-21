import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LandingPage from './components/LandingPage.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<App />} />
        {/* Catch-all: redirect unknown paths to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
