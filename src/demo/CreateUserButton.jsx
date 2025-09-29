import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CreateUserPage() {
  const API_BASE = "http://localhost:8080";
  const token = localStorage.getItem("authToken");

  const [form, setForm] = useState({
    customerId: "",
    name: "",
    username: "",
    phone: "",
    card: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/iam/accounts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMessage(`✅ User Created: ${JSON.stringify(data)}`);
    } catch (err) {
      setMessage("❌ Error creating user");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Create User
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer ID</Label>
            <Input
              id="customerId"
              name="customerId"
              placeholder="Enter customer ID"
              value={form.customerId}
              onChange={handleChange}
              className="border border-gray-400 dark:border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-400 dark:border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="Enter username"
              value={form.username}
              onChange={handleChange}
              className="border border-gray-400 dark:border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              className="border border-gray-400 dark:border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card">Card Number</Label>
            <Input
              id="card"
              name="card"
              placeholder="Enter card number"
              value={form.card}
              onChange={handleChange}
              className="border border-gray-400 dark:border-border"
            />
          </div>

          <Separator />

          <Button className="w-full" onClick={handleSubmit}>
            Submit
          </Button>

          {message && (
            <div className="mt-4 p-3 rounded-lg border bg-gray-50 text-sm text-gray-700 shadow-sm">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
