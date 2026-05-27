import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Importa tu archivo de estilos global, usualmente es index.css o App.css
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)