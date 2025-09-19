import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import logo from "../assets/banklogo.jpg";


function QrPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSession = location.state;

  const [sessionData, setSessionData] = useState(initialSession);
  const [timeLeft, setTimeLeft] = useState(60);
  const [status, setStatus] = useState("PENDING");

  // Refresh QR every 60s
  useEffect(() => {
    if (!initialSession) return;

    const qrInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/iam/api/qr/next?sessionId=${initialSession.sessionId}&includePng=false`
        );
        if (!res.ok) {
          console.error("Failed to fetch next QR", res.status);
          return;
        }
        const data = await res.json();
        setSessionData((prev) => ({
          ...prev,
          ...data,
          sessionId: prev.sessionId,
        }));
        setTimeLeft(60);
      } catch (err) {
        console.error("Error fetching next QR:", err);
      }
    }, 60 * 1000);

    return () => clearInterval(qrInterval);
  }, [initialSession]);

  // Countdown timer
  useEffect(() => {
    if (!sessionData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionData]);

  // Poll session status
  useEffect(() => {
    if (!initialSession) return;

    const statusInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/iam/api/qr/status?sessionId=${initialSession.sessionId}`
        );
        if (!res.ok) return;

        const data = await res.json();
        setStatus(data.state);

        if (data.state === "VERIFIED") {
          clearInterval(statusInterval);
          navigate("/dashboard");
        } else if (data.state === "EXPIRED") {
          clearInterval(statusInterval);
          alert("Session timed out. Please login again.");
          navigate("/login");
        }
      } catch (err) {
        console.error("Error checking status:", err);
      }
    }, 10 * 1000);

    return () => clearInterval(statusInterval);
  }, [initialSession, navigate]);

  if (!sessionData) {
    return <p className="no-session">No session data found. Please login again.</p>;
  }

  return (
    <div className="qr-container">
      {/* Logo */}
      <img src={logo} alt="Logo" className="qr-logo" />

      {/* QR Code Box */}
      <div className="qr-box">
        <QRCodeCanvas value={sessionData.jwt} size={220} />
        <p>SCAN ME</p>
       
      </div>
       <p className="qr-timer">⏳ Refresh in <span>{timeLeft}s</span></p>

      {/* Session Info */}
      <div className="qr-info">
        <p className={`status status-${status.toLowerCase()}`}>
          Status: {status}
        </p>

      </div>
    </div>
  );
}

export default QrPage;
