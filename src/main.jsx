import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { SettingsProvider, AuthProvider, EnquiryProvider } from './lib/hooks'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary><SettingsProvider><AuthProvider><EnquiryProvider><App /></EnquiryProvider></AuthProvider></SettingsProvider></ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)
