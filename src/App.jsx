import Login from "./components/login"
import './styles/global.scss'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QrPage from "./components/QrPage";


function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/qr" element={<QrPage/>} />
        
      </Routes>
    </Router>
  )
}

export default App
