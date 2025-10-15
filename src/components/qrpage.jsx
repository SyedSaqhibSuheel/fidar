import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import logo from "../assets/banklogo.jpg";
import ModeToggle from "@/components/theme-provider/mode-toggle";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

  const qrValue = useMemo(() => JSON.stringify(sessionData) ?? "", [sessionData]);

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

  useEffect(() => {
    if (!sessionData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionData]);

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
          localStorage.setItem("sessionData", JSON.stringify(sessionData));
          clearInterval(statusInterval);
          navigate("/dashboard");
          toast({
            title: "Verified",
            description: "Redirecting you to Dashboard...",
            duration: 3000,
          });
        } else if (data.state === "EXPIRED") {
          clearInterval(statusInterval);
        }
      } catch {
        // soft fail
      }
    }, 10_000);
    return () => clearInterval(statusInterval);
  }, [initialSession, navigate, toast]);

  if (!sessionData) {
    return (
      <main className="relative flex justify-center items-center min-h-screen bg-muted/30 p-4">
        <div className="absolute top-3 right-3 z-50">
          <ModeToggle />
        </div>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle>No session found</CardTitle>
            <CardDescription>Please start a new login session.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-36 w-full rounded-lg" />
            <div className="mt-3 flex justify-end">
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
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-muted/30 p-3">
      <div className="absolute top-3 right-3 z-50">
        <ModeToggle />
      </div>

      <div className="relative w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-br from-blue-400/40 via-cyan-400/35 to-emerald-400/40 blur-sm z-0"
          aria-hidden="true"
        />
        <Card className="relative shadow-md border rounded-2xl z-10">
          <CardHeader className="pt-4 px-5 pb-2">
            <div className="w-full flex justify-center mb-2">
              <img
                src={logo}
                alt="Smart Bank"
                className="w-16 sm:w-20 rounded-md shadow select-none"
                draggable={false}
              />
            </div>
            <div className="text-center">
              <CardTitle className="text-base sm:text-lg font-semibold">
                Scan to login
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Use the mobile app to scan this code
              </CardDescription>
            </div>
          </CardHeader>

          <Separator className="mx-5" />

          <CardContent className="flex flex-col items-center gap-3 py-4">
            <div className="w-[180px] sm:w-[200px]">
              <AspectRatio ratio={1}>
                <div className="p-1.5 rounded-lg bg-white shadow-sm h-full w-full flex items-center justify-center">
                  {qrValue ? (
                    <QRCodeCanvas
                      value={qrValue}
                      size={180}
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

            <Badge
              variant={
                isVerified ? "default" : isExpired ? "destructive" : "secondary"
              }
              className="uppercase tracking-wide font-semibold px-2 py-0.5 text-xs"
            >
              Status: {status}
            </Badge>

            <div className="w-full max-w-xs text-center">
              <p className="text-xs mb-1">⏳ Refreshing in {timeLeft}s</p>
              <Progress value={(timeLeft / 60) * 100} className="h-2 rounded-full" />
            </div>

            {error && (
              <Alert variant="destructive" className="w-full p-2 text-xs">
                <AlertTitle className="text-sm">Connection issue</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isExpired && (
              <Alert className="w-full p-2 text-xs">
                <AlertTitle className="text-sm">Session expired</AlertTitle>
                <AlertDescription>
                  Return to login to start a new QR session.
                </AlertDescription>
              </Alert>
            )}

            <div className="w-full rounded-md border p-3 bg-background/60">
              <p className="font-medium mb-2 text-xs">How to login</p>
              <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                <li className="flex gap-1 items-start">
                  <ShieldCheck className="h-3 w-3 mt-0.5 text-emerald-600 shrink-0" />
                  <span>Open Smart Bank app → “QR Login”.</span>
                </li>
                <li className="flex gap-1 items-start">
                  <RefreshCcw className="h-3 w-3 mt-0.5 text-blue-600 shrink-0" />
                  <span>QR refreshes every 60s automatically.</span>
                </li>
                <li>Keep this page open until verified.</li>
              </ul>
            </div>

            <div className="flex w-full justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
              >
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default QrPage;
