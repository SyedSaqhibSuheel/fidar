import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import logo from "../assets/banklogo.jpg";
import fidarLogo from "../assets/fidarlogo.jpg";
import { toast } from "@/hooks/use-toast";

import ModeToggle from "@/components/theme-provider/mode-toggle";

function Login() {
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!customerId.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/iam/api/qr/start?includePng=false",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerId }),
        }
      );
      if (!response.ok) throw new Error("Failed to login");
      const data = await response.json();
      navigate("/qr", { state: data });
      toast({
        title: "Login successful",
        description: "Redirecting you to QR page...",
        duration: 3000
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please check your Customer ID and try again.",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="
        relative
        flex items-center justify-center min-h-dvh
        bg-gradient-to-br from-background to-muted
        px-3 sm:px-4
      "
    >
      {/* Top-right mode toggle */}
      <div className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4">
        <div className="pointer-events-auto">
          <ModeToggle />
        </div>
      </div>

      <Card
        className="
          w-full
          max-w-[21rem]
          sm:max-w-sm
          md:max-w-md
          shadow-lg
          border-2
          border-slate-300
          dark:border-slate-700
        "
      >
        <CardHeader className="flex flex-col items-center space-y-3 pt-6 sm:pt-8">
          <img
            src={logo}
            alt="Smart Bank Logo"
            className="h-14 sm:h-16 md:h-20 w-auto rounded-md drop-shadow-md select-none"
            draggable={false}
          />
          <CardTitle
            className="
              text-[1.25rem]
              sm:text-xl
              md:text-2xl
              font-bold tracking-tight select-none
            "
          >
            Welcome Back
          </CardTitle>
          <CardDescription
            className="
              text-center
              max-w-[28ch]
              sm:max-w-md
              text-[0.95rem]
              sm:text-sm
              md:text-base
              text-muted-foreground
            "
          >
            Please login with your Customer ID to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 px-4 sm:px-6 pt-3 pb-5">
          <div className="space-y-2">
            <Label
              htmlFor="customer-id"
              className="font-medium text-[0.95rem] sm:text-sm md:text-base"
            >
              Customer ID
            </Label>
            <TooltipProvider delayDuration={250}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    id="customer-id"
                    placeholder="Enter your Customer ID"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    onKeyDown={handleKeyPress}
                    autoComplete="username"
                    aria-describedby="customer-id-info"
                    className="
                      h-11
                      text-[0.98rem]
                      sm:h-10
                      sm:text-sm
                      md:text-base
                      border border-gray-400 dark:border-border
                    "
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="start"
                  className="max-w-xs text-xs sm:text-sm"
                >
                  <p id="customer-id-info">
                    Your unique identifier provided by Smart Bank.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            className="w-full h-11 text-[1rem] sm:h-10 sm:text-sm"
            disabled={!customerId.trim() || loading}
            onClick={handleLogin}
            aria-label="Login to your account"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </CardContent>

        <Separator className="mx-4 sm:mx-6" />

        <CardFooter className="flex flex-col space-y-4 text-center px-4 sm:px-6 py-5">
          <p className="text-[0.9rem] sm:text-xs md:text-sm text-muted-foreground max-w-[36ch] sm:max-w-md mx-auto leading-relaxed">
            By proceeding, you agree to our{" "}
            <a href="#" className="underline hover:text-primary focus:text-primary">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-primary focus:text-primary">
              Terms & Conditions
            </a>
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
            <p className="text-[0.9rem] sm:text-xs md:text-sm text-muted-foreground">
              Powered by
            </p>
            <img
              src={fidarLogo}
              alt="Powered by YourCompany"
              className="h-9 sm:h-10 md:h-12 w-auto select-none mx-auto sm:mx-0"
              draggable={false}
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Login;
