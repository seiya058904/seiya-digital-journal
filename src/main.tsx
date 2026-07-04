import { createRoot } from 'react-dom/client'

import { AuthProvider } from './auth/AuthContext'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/hero-background.css'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)
