import { createRoot } from 'react-dom/client'

import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/hero-background.css'

createRoot(document.getElementById('root')!).render(
  <App />,
)
