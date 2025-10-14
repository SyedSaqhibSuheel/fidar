import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function CreateUserPage() {
  const API_BASE = "http://localhost:8080";
  const token = localStorage.getItem("authToken"); // JWT stored here

  const [form, setForm] = useState({
    customerId: "",
    name: "",
    username: "",
    phone: "",
    card: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.customerId || !form.name || !form.username || !form.phone || !form.card) {
      setMessage("⚠️ Please fill in all fields before submitting.");
      return;
    }

    if (!token) {
      setMessage("❌ No auth token found in localStorage. Please log in first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/iam/accounts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(data?.message || `Server returned ${response.status}`);
      }

      setMessage(
        `✅ User created successfully (ID: ${data?.id || "N/A"} | Username: ${
          data?.username || form.username
        })`
      );
      setForm({
        customerId: "",
        name: "",
        username: "",
        phone: "",
        card: "",
      });
    } catch (err) {
      console.error("Error creating user:", err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold text-gray-800">
            Create User
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Customer ID */}
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              name="customerId"
              placeholder="CUST12345"
              value={form.customerId}
              onChange={handleChange}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
            />
          </div>

          {/* Phone with country code */}
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <PhoneInput
              country={"us"} // default
              enableSearch={true}
              value={form.phone}
              onChange={(phone) => setForm({ ...form, phone: `+${phone}` })}
              inputStyle={{
                width: "100%",
                height: "2.5rem",
                fontSize: "1rem",
                borderRadius: "0.5rem",
                borderColor: "#ccc",
              }}
              buttonStyle={{
                border: "none",
                background: "transparent",
              }}
              dropdownStyle={{
                zIndex: 1000,
              }}
            />
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="card">Card Number</Label>
            <Input
              id="card"
              name="card"
              placeholder="4111111111111111"
              value={form.card}
              onChange={handleChange}
            />
          </div>

          <Separator />

          {/* Submit */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg border text-sm shadow-sm ${
                message.startsWith("✅")
                  ? "bg-green-50 border-green-300 text-green-700"
                  : message.startsWith("⚠️")
                  ? "bg-yellow-50 border-yellow-300 text-yellow-700"
                  : "bg-red-50 border-red-300 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
