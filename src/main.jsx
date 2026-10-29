import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { I18nProvider } from './i18n/I18nContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { PrefsProvider } from './context/PrefsContext.jsx'
import { LibraryProvider } from './context/LibraryContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import App from './App.jsx'
import './styles/global.css'
// regista cedo o pedido de instalação (beforeinstallprompt) da própria loja
import './lib/installPrompt.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <PrefsProvider>
              <LibraryProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </LibraryProvider>
            </PrefsProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
