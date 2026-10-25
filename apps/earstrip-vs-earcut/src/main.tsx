import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ready } from 'earstrip'
import './index.css'
import App from './App.tsx'

// earstrip's WASM module compiles synchronously where allowed; await ready covers the rest.
ready.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
