import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './Home/Home.jsx'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

document.getElementById('root').style.backgroundColor = "black";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Navbar></Navbar>
    <App />
    <Footer></Footer>
  </StrictMode>,
)
