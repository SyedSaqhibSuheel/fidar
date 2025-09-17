import React from "react";
import { QRCodeCanvas } from "qrcode.react";

function QrPage({ sessionData }) {
  if (!sessionData) {
    return <p>No session data found. Please login again.</p>;
  }

  return (
    <div className="qr-page">
      <h2>Scan the QR Code</h2>
      <QRCodeCanvas value={sessionData.jwt} size={256} /> 
      <p>Session ID: {sessionData.sessionId}</p>
      <p>
        Expires At:{" "}
        {new Date(sessionData.sessionExpiresAtEpochSec * 1000).toLocaleString()}
      </p>
    </div>
  );
}

export default QrPage;
