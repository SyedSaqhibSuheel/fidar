import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CallVerificationPage() {
  const API_BASE = "http://localhost:8080";
  const token = localStorage.getItem("authToken");

  const [empId, setEmpId] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE}/iam/verification/call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeId: empId }),
      });

      // ✅ Defensive check in case backend doesn’t return JSON
      const data = await res.json().catch(() => ({}));

      setMessage(`📞 Call Verification: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      setMessage("❌ Error in call verification");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="w-full max-w-md shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Call Verification
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empId">Employee ID</Label>
            <Input
              id="empId"
              placeholder="Enter employee ID"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
          >
            Verify
          </Button>

          {message && (
            <pre className="mt-4 p-3 rounded-lg border bg-gray-50 text-sm text-gray-700 shadow-sm whitespace-pre-wrap">
              {message}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
