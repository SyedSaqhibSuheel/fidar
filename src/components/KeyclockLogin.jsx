import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: "https://keycloak.staging.fidar.io/", // your Keycloak base URL
  realm: "Testing2",                         // your realm
  clientId: "saqhib_1",                      // your clientId
};

const keycloak = new Keycloak(keycloakConfig);

const KeycloakLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    keycloak
      .init({ onLoad: "login-required" })
      .then((authenticated) => {
        if (authenticated) {
          console.log("✅ Authenticated via Keycloak");
          console.log("Access Token:", keycloak.token);

          // Save token locally (optional)
          localStorage.setItem("token", keycloak.token);
          localStorage.setItem("refreshToken", keycloak.refreshToken);

          // Redirect to dashboard
          navigate("/dashboard");
        } else {
          console.warn("⚠️ Not authenticated! Redirecting to Keycloak login...");
          keycloak.login();
        }
      })
      .catch((error) => {
        console.error("❌ Keycloak initialization failed:", error);
      });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h2 className="text-xl font-semibold text-gray-700">
        Logging in with Keycloak...
      </h2>
      <p className="text-sm text-gray-500 mt-2">
        Please wait while we verify your credentials.
      </p>
    </div>
  );
};

export default KeycloakLogin;
