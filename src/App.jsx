import Login from "./components/login"
// import './styles/global.scss'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QrPage from "./components/qrpage";
import DashBoard from "./components/DashBoard";
import ProfilePage from "./components/profile";
import ActionsPage from "./demo/ActionPage";
import CreateUserPage from "./demo/CreateUserButton";
import CallVerificationPage from "./demo/CallVerification";
import SalesVerificationPage from "./demo/SalesVerification";
import ATMDashboard from "./components/ATM-Dashboard";
import AtmQrPage from "./components/Atm-qrpage";


function App() {


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route path="/qr" element={<QrPage/>} />
         <Route path="/atm-qr" element={<AtmQrPage />} />
         <Route path="/dashboard" element={<DashBoard/>} />
         <Route path="/profile" element={<ProfilePage />} />
         <Route path="/atm-dashboard" element={<ATMDashboard />} />
         <Route path="/demo" element={<ActionsPage/>} />
         <Route path="/create-user" element={<CreateUserPage />} />
          <Route path="/call-verification" element={<CallVerificationPage />} />
           <Route path="/sales-verification" element={<SalesVerificationPage />} />


        
      </Routes>
    </Router>
  )
}

export default App
