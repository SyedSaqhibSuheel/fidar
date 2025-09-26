import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import logo from "../assets/banklogo.jpg";
import ModeToggle from "@/components/theme-provider/mode-toggle";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, ShieldCheck } from "lucide-react";

function QrPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSession = location.state;
  const { toast } = useToast();

  const [sessionData, setSessionData] = useState(initialSession);
  const [timeLeft, setTimeLeft] = useState(60);
  const [status, setStatus] = useState("PENDING");
  const [error, setError] = useState("");

  // QR value
  const qrValue = useMemo(() => JSON.stringify(sessionData) ?? "", [sessionData]); // Absolute/fixed positioning depends on nearest positioned ancestor [web:83][web:88][web:98]

  // Refresh QR every 60s
  useEffect(() => {
    if (!initialSession) return;
    const qrInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/iam/api/qr/next?sessionId=${initialSession.sessionId}&includePng=false`
        );
        if (!res.ok) {
          setError("Failed to refresh QR. Retrying in 60s.");
          return;
        }
        const data = await res.json();
        setSessionData((prev) => ({
          ...prev,
          ...data,
          sessionId: prev.sessionId,
        }));
        setTimeLeft(60);
        setError("");
      } catch (err) {
        setError("Network error while refreshing QR.");
      }
    }, 60_000);
    return () => clearInterval(qrInterval);
  }, [initialSession]); // Card layout can contain mixed header/body content per docs [web:44]

  // Countdown timer
  useEffect(() => {
    if (!sessionData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionData]); // Card composition remains standard [web:44]

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
          toast({
            title: "Verified",
            description: "Redirecting you to Dashboard...",
            duration: 3000
          });
        } else if (data.state === "EXPIRED") {
          clearInterval(statusInterval);
        }
      } catch {
        // soft fail; keep polling
      }
    }, 10_000);
    return () => clearInterval(statusInterval);
  }, [initialSession, navigate, toast]); // Business logic unchanged [web:44]

  // Empty state
  if (!sessionData) {
    return (
      <main className="relative flex justify-center items-center min-h-screen bg-muted/30 p-6">
        {/* Place toggle at page top-right: position relative is on main */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50">
          <ModeToggle />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No session found</CardTitle>
            <CardDescription>Please start a new login session.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full rounded-lg" />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => navigate("/")}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    ); // Card API reference [web:44]
  }

  const isExpired = status === "EXPIRED";
  const isVerified = status === "VERIFIED";

  return (
    // main is relative, so the absolute toggle is anchored to the page, not the card
    <main className="relative flex flex-col items-center min-h-screen bg-muted/30 p-4 sm:p-6">
      {/* Top-right mode toggle at page level */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50">
        <ModeToggle />
      </div>

      {/* Single card with logo, QR, status, timer, instructions, and action */}
      <div className="relative w-full max-w-md">
        {/* Keep the glow behind content */}
        <div
          className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br from-blue-400/40 via-cyan-400/35 to-emerald-400/40 blur-sm z-0"
          aria-hidden="true"
        />
        <Card className="relative shadow-lg border rounded-2xl z-10">
          {/* Header with centered logo and title */}
          <CardHeader className="pt-6 px-6">
            <div className="w-full flex justify-center mb-3">
              <img
                src={logo}
                alt="Smart Bank"
                className="w-20 sm:w-24 rounded-md shadow select-none"
                draggable={false}
              />
            </div>
            <div className="text-center">
              <CardTitle className="text-lg sm:text-xl font-semibold">Scan to login</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Use the mobile app to scan this code
              </CardDescription>
            </div>
          </CardHeader>

          <Separator className="mx-6 mt-2" />

          <CardContent className="flex flex-col items-center gap-5 py-6">
            {/* QR with white box for scannability in dark mode */}
            <div className="w-[220px] sm:w-[240px]">
              <AspectRatio ratio={1}>
                <div className="p-2 rounded-lg bg-white shadow-sm h-full w-full flex items-center justify-center">
                  {qrValue ? (
                    <QRCodeCanvas
                      value={qrValue}
                      size={200}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      includeMargin={false}
                      level="M"
                    />
                  ) : (
                    <Skeleton className="h-full w-full rounded-md" />
                  )}
                </div>
              </AspectRatio>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge
                variant={isVerified ? "default" : isExpired ? "destructive" : "secondary"}
                className="uppercase tracking-wide font-semibold px-3 py-1"
                aria-live="polite"
                aria-atomic="true"
              >
                Status: {status}
              </Badge>
            </div>

            {/* Timer */}
            <div className="w-full max-w-xs text-center">
              <p className="text-sm mb-2">⏳ Refreshing in {timeLeft}s</p>
              <Progress value={(timeLeft / 60) * 100} className="h-2.5 rounded-full" />
            </div>

            {/* Errors / expiry */}
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertTitle>Connection issue</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isExpired && (
              <Alert className="w-full">
                <AlertTitle>Session expired</AlertTitle>
                <AlertDescription>
                  Return to login to start a new QR session.
                </AlertDescription>
              </Alert>
            )}

            {/* Inline instructions inside the Card */}
            <div className="w-full rounded-lg border p-4 bg-background/60">
              <p className="font-medium mb-3 text-sm">How to login</p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2 items-start">
                  <ShieldCheck className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                  <span>Open the Smart Bank mobile app and go to “QR Login”.</span>
                </li>
                <li className="flex gap-2 items-start">
                  <RefreshCcw className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
                  <span>QR refreshes every 60s automatically for security.</span>
                </li>
                <li>Keep this card open until the login is verified.</li>
                <li>If the session expires, return to the login page and try again.</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>Back to login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default QrPage;
