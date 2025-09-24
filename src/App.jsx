import Login from "./components/login"
// import './styles/global.scss'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QrPage from "./components/qrpage";
import DashBoard from "./components/DashBoard";
import ProfilePage from "./components/profile";


function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/qr" element={<QrPage/>} />
         <Route path="/dashboard" element={<DashBoard/>} />
         <Route path="/profile" element={<ProfilePage />} />

        
      </Routes>
    </Router>
  )
}

export default App
