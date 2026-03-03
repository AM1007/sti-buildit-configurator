import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { migrateLocalStorage } from './utils/migrateLocalStorage'
import './index.css'
import App from './App.tsx'

migrateLocalStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)