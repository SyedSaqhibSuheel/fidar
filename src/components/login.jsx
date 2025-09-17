import React from "react";
import logo from "../assets/banklogo.jpg";
import fidarLogo from "../assets/fidarlogo.jpg";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";


function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        
        {/* Top Image */}
        <img
          src={logo}
          alt="Bank Logo"
          className="login-logo"
        />

        {/* Customer ID Label */}
        <h2 className="login-label">Customer ID</h2>

        {/* MUI Input Box */}
        <Box
          component="form"
          noValidate
          autoComplete="off"
          className="login-input-box"
        >
          <TextField
            fullWidth
            id="customer-id"
            label="Enter Customer ID"
            variant="outlined"
            size="small"
          />
        </Box>

        {/* MUI Login Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className="login-button"
        >
          Login
        </Button>

        {/* Footer Section */}
        <div className="login-footer">
          <p className="footer-text">
            By proceeding you are agreeing to our{" "}
            <a href="#">Privacy Policy</a> and{" "}
            <a href="#">Terms & Conditions</a>
          </p>
          <p className="footer-powered">Powered by YourCompany</p>
          <img 
            src={fidarLogo}
            alt="Powered Logo"
            className="footer-logo"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
