import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { migrateLocalStorage } from '@shared/utils/migrateLocalStorage'
import './index.css'
import App from './app/App.tsx'

migrateLocalStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
