import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { SettingsProvider, AuthProvider, EnquiryProvider, CatalogProvider } from './lib/hooks'
import { ToastProvider } from './components/Toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary><SettingsProvider><AuthProvider><CatalogProvider><EnquiryProvider><ToastProvider><App /></ToastProvider></EnquiryProvider></CatalogProvider></AuthProvider></SettingsProvider></ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)
