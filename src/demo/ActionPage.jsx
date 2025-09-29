import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThreeDSButton from "./ThreeDSButton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ActionsPage() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Card className="w-full max-w-lg shadow-lg border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Verification Actions
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col items-center space-y-4">
          <Button
            className="w-64"
            onClick={() => navigate("/create-user")}
            variant="default"
          >
            Create User
          </Button>

          <Button
            className="w-64 bg-green-600 hover:bg-green-700"
            onClick={() => navigate("/call-verification")}
          >
            Call Verification
          </Button>

          <Button
            className="w-64 bg-purple-600 hover:bg-purple-700"
            onClick={() => navigate("/sales-verification")}
          >
            Sales Verification
          </Button>

          <Separator className="my-4" />

          {/* 3DS inline */}
          <ThreeDSButton onResult={setMessage} />

          {message && (
            <div className="mt-4 w-full p-3 rounded-lg border bg-gray-50 text-sm text-gray-700 shadow-sm">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
