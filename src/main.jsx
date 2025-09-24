import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "@/components/theme-provider/theme-provider";
import { Toaster } from './components/ui/toaster';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Toaster />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
