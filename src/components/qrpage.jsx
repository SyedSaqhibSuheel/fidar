import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

function QrPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSession = location.state;

  const [sessionData, setSessionData] = useState(initialSession);
  const [timeLeft, setTimeLeft] = useState(60); // countdown for QR refresh
  const [status, setStatus] = useState("PENDING"); // session state

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

        // Keep the original sessionId
        setSessionData((prev) => ({
          ...prev,
          ...data,
          sessionId: prev.sessionId,
        }));

        setTimeLeft(60); // reset countdown
      } catch (err) {
        console.error("Error fetching next QR:", err);
      }
    }, 60 * 1000);

    return () => clearInterval(qrInterval);
  }, [initialSession]);

  // Countdown timer for QR refresh
  useEffect(() => {
    if (!sessionData) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionData]);

  // Poll session status every 10s
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
    return <p>No session data found. Please login again.</p>;
  }

  return (
    <div className="qr-page">
      <h2>Scan the QR Code</h2>
      <QRCodeCanvas value={sessionData.jwt} size={256} />
      <p>Status: {status}</p>
      <p>Session ID: {sessionData.sessionId}</p>
      <p>
        Session Expires At:{" "}
        {new Date(sessionData.sessionExpiresAtEpochSec * 1000).toLocaleString()}
      </p>
      <p>
        Current QR Expires At:{" "}
        {new Date(sessionData.jwtExpiresAtEpochSec * 1000).toLocaleString()}
      </p>
      <p>⏳ Next QR refresh in: {timeLeft}s</p>
    </div>
  );
}

export default QrPage;
