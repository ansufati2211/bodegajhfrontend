import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import './index.css'
import Login from './components/Login'
import Inventory from './pages/inventory'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Inventory />
    </>
  )
}

export default App
