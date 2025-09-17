import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/banklogo.jpg";
import fidarLogo from "../assets/fidarlogo.jpg";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function Login() {
  const [customerId, setCustomerId] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/iam/api/qr/start?includePng=false",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const data = await response.json();
      console.log("API Response:", data);

    
      navigate("/qr", { state: data });
    } catch (error) {
      console.error("Error:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
       
        <img src={logo} alt="Bank Logo" className="login-logo" />

   
        <h2 className="login-label">Customer ID</h2>

    
        <Box component="form" noValidate autoComplete="off" className="login-input-box">
          <TextField
            fullWidth
            id="customer-id"
            label="Enter Customer ID"
            variant="outlined"
            size="small"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
        </Box>

    
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className="login-button"
          onClick={handleLogin}
        >
          Login
        </Button>

   
        <div className="login-footer">
          <p className="footer-text">
            By proceeding you are agreeing to our{" "}
            <a href="#">Privacy Policy</a> and{" "}
            <a href="#">Terms & Conditions</a>
          </p>
          <p className="footer-powered">Powered by YourCompany</p>
          <img src={fidarLogo} alt="Powered Logo" className="footer-logo" />
        </div>
      </div>
    </div>
  );
}

export default Login;
