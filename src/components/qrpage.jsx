import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import logo from "../assets/banklogo.jpg";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";
import { Copy, HelpCircle, RefreshCcw, ShieldCheck } from "lucide-react";

function QrPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSession = location.state;
  const { toast } = useToast();

  const [sessionData, setSessionData] = useState(initialSession);
  const [timeLeft, setTimeLeft] = useState(60);
  const [status, setStatus] = useState("PENDING");
  const [error, setError] = useState("");

  // Compute QR value defensively
  const qrValue = useMemo(() => sessionData?.jwt ?? "", [sessionData]);

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
  }, [initialSession, navigate]);

  // Empty state
  if (!sessionData) {
    return (
      <main className="flex justify-center items-center min-h-screen bg-muted/30 p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
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
    );
  }

  const isExpired = status === "EXPIRED";
  const isVerified = status === "VERIFIED";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-4 sm:p-6">
      {/* Header row: logo + help */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <img
                src={logo}
                alt="Smart Bank"
                className="w-24 sm:w-28 rounded-md shadow cursor-help select-none"
                draggable={false}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-xs">
              <p>Secure and trusted banking</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>How to login</SheetTitle>
              <SheetDescription>Scan the QR with your Smart Bank app.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 mt-0.5 text-emerald-600" />
                <p>Open the Smart Bank mobile app and go to “QR Login”.</p>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCcw className="h-4 w-4 mt-0.5 text-blue-600" />
                <p>QR refreshes every 60s automatically for security.</p>
              </div>
              <p>If the session expires, return to the login page and try again.</p>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* QR Card with subtle gradient outline */}
      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br from-blue-400/40 via-cyan-400/35 to-emerald-400/40 blur-sm" aria-hidden="true" />
        <Card className="relative shadow-lg border rounded-2xl">
          <CardHeader className="text-center pt-6 px-6">
            <CardTitle className="text-lg sm:text-xl font-semibold">Scan to login</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Use the mobile app to scan this code
            </CardDescription>
          </CardHeader>

          <Separator className="mx-6 mt-2" />

          <CardContent className="flex flex-col items-center gap-5 py-6">
            {/* QR with fixed square ratio, responsive size */}
            <div className="w-[220px] sm:w-[240px]">
              <AspectRatio ratio={1}>
                <div className="p-2 rounded-lg bg-white shadow-sm h-full w-full flex items-center justify-center">
                  {qrValue ? (
                    <QRCodeCanvas value={qrValue} size={200} />
                  ) : (
                    <Skeleton className="h-full w-full rounded-md" />
                  )}
                </div>
              </AspectRatio>
            </div>

            {/* Status + copy session */}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  isVerified ? "default" : isExpired ? "destructive" : "secondary"
                }
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

            {/* Error or expired alerts */}
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
