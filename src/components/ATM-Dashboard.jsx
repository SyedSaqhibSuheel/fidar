import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Landmark, ShieldCheck, Circle, CreditCard, Receipt, Info, CheckCircle2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/banklogo.jpg";

// Constants
const ATM_COLORS = {
  room: "from-zinc-100 via-white to-zinc-100",
  bezel: "bg-white",
  bezelAccent: "bg-gradient-to-b from-zinc-200 to-zinc-300",
  screen: "border border-emerald-100 bg-gradient-to-b from-white to-emerald-50/40 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_10px_20px_-14px_rgba(16,185,129,0.25)]",
  screenText: "text-zinc-900",
  accent: "text-emerald-700",
  primary: "bg-emerald-600 hover:bg-emerald-700",
  secondary: "bg-zinc-200 hover:bg-zinc-300",
  enter: "bg-emerald-600 hover:bg-emerald-700 text-white",
  clear: "bg-amber-500 hover:bg-amber-600 text-white",
  cancel: "bg-red-600 hover:bg-red-700 text-white",
  ledOn: "text-emerald-600",
  ledOff: "text-zinc-500",
};


const SOFT_LEFT = ["Account Info", "Withdraw", "Deposit"];
const SOFT_RIGHT = ["PIN change", "Balance", "Other Services"];

const MIN_WITHDRAW = 20;
const MAX_WITHDRAW = 800;
const DENOM = 20;

// API Configuration
const BASE = "http://localhost:8080/iam";
const deviceId = crypto.randomUUID();

// Utility Functions
const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const fmtCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount || 0));

const isValidAmount = (amt) => amt && amt > 0 && Number.isFinite(amt);

// State management
const sessionState = {
  getToken: () => {
    const raw = window.localStorage?.getItem("AtmsessionData");
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?.token || "";
    } catch {
      return "";
    }
  }
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${sessionState.getToken()}`,
});

// API Functions
async function sendWithdrawNotify({ customerId, amount }) {
  const res = await fetch(`${BASE}/api/notify/token`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      customerId,
      title: "Cash Withdrawal Approval",
      description: "Approval request from Smart ATM",
      body: `Tap to approve withdrawal of ₹${amount}`,
      channel: "HIGH_ALERT",
      data: {
        action: "CASH_WITHDRAW",
        amount: String(amount),
        message: "Approve ATM Cash Withdrawal",
        deepLink: `app://auth/approve?type=withdraw&amount=${amount}`,
      },
    }),
  });
  if (!res.ok) throw new Error(`Notify failed: ${res.status}`);
  return res.json();
}

async function getApprovalStatus(sessionId) {
  const res = await fetch(`${BASE}/api/approval/status/${sessionId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Status failed: ${res.status}`);
  return res.json();
}

async function postWithdraw(amount) {
  const res = await fetch(`${BASE}/transactions/withdraw`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "x-device-id": String(deviceId),
    },
    body: JSON.stringify({ amount: String(amount) }),
  });
  if (!res.ok) throw new Error(`Withdraw failed: ${res.status}`);
  return res.json();
}

async function getWallet() {
  const res = await fetch(`${BASE}/wallets`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Wallet failed: ${res.status}`);
  const data = await res.json();
  const amount = Number(data?.balance?.amount ?? 0);
  const currency = data?.balance?.currency ?? "USD";
  return { amount, currency, raw: data };
}

async function pollApproval({ sessionId, intervalMs = 2000, timeoutMs = 300000, fetchStatus }) {
  const start = Date.now();
  while (true) {
    const { status } = await fetchStatus(sessionId);
    if (status === "APPROVED") return { status };
    if (status === "DECLINED" || status === "EXPIRED") return { status };
    if (Date.now() - start > timeoutMs) return { status: "TIMEOUT" };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

// Sub-Components
export function AtmHeader() {
  return (
    <CardHeader className={`p-0 ${ATM_COLORS.bezel}`}>
      <div className="relative p-4 sm:p-5">
        <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-normal bg-gradient-to-b from-white/60 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900">
            <img
              src={logo}
              alt="Smart Bank Logo"
              className="h-10 w-auto rounded-sm"
              loading="eager"
              decoding="async"
            />
            <CardTitle className="text-base sm:text-lg">Smart Bank ATM</CardTitle>
          </div>
        </div>
      </div>
      <div className={`border-b border-zinc-300 ${ATM_COLORS.bezelAccent}`} />
    </CardHeader>
  );
}

// NEW: Inline screen sections (replace AtmScreen, OperationDialog, ReceiptSheet)

function ScreenBody({
  stage,
  balance,
  currency,
  inputAmount,
  toAccount,
  pin,
  maskedPin,
  infoMessage,
  onSoftOption,
  onKey,
  busy,
  // NEW handlers to allow interactable fields + actions
  onChangeAmount,
  onChangeAccount,
  onChangePin,
  onSubmit,
  onCloseToMenu,
  pinVisible,
  onTogglePinVisible,
}) {
  const Line = ({ children }) => (
    <div className="text-sm sm:text-base text-zinc-800">{children}</div>
  );
  const Hint = ({ children }) => (
    <div className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1">
      <Info className="w-4 h-4" />
      <span>{children}</span>
    </div>
  );

  // Welcome screen with NO option list
  if (stage === "menu") {
    return (
      <div
        className={[
          "w-full px-2 pt-2 sm:p-4",
          ATM_COLORS.screen,            // bg-zinc-50
          ATM_COLORS.screenText,        // text-zinc-900
          "rounded-md overflow-hidden",
          // screen-like border + subtle tint and depth
          `${ATM_COLORS.screen}`,
          // center content
          "flex flex-col items-center justify-center",
          "min-h-[260px] sm:min-h-[320px]",  // ensure vertical space to center
          "text-center",
        ].join(" ")}
      >
        <div className={`text-xl sm:text-3xl font-semibold ${ATM_COLORS.accent}`}>
          Welcome to Smart Bank ATM
        </div>
  
        <Separator className="my-3 bg-zinc-200 "/>
  
        <div className="space-y-2 max-w-[36ch] sm:max-w-[48ch] text-sm sm:text-base text-zinc-700 leading-relaxed">
          <p>Use the side buttons to choose a service. The selected screen will appear here with simple steps.</p>
          <p>When prompted, enter numbers using the keypad. Submit and Close will be shown on each screen.</p>
        </div>
  
        <div className="mt-3 text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1">
          <Info className="w-4 h-4" />
          <span>Press a side button to begin.</span>
        </div>
      </div>
    );
  }
  
  

  // Info screens (still inline, with a Close button)
  if (stage === "balance") {
    return (
      <div className={`w-full px-2 pt-2 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} flex flex-col rounded-md`}>
        <div className="text-lg sm:text-2xl font-semibold text-emerald-700">Balance</div>
        <Separator className="my-2 sm:my-3 bg-zinc-200" />
        <Line>Available: {fmtCurrency(balance, currency)}</Line>
        <Line>Ledger: {fmtCurrency(balance, currency)}</Line>
        <div className="mt-4 flex gap-2">
          <Button onClick={onCloseToMenu} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900">Close</Button>
        </div>
        <Hint>Use Close to return to the welcome screen.</Hint>
      </div>
    );
  }

  if (stage === "account") {
    return (
      <div className={`w-full px-2 pt-2 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} flex flex-col rounded-md`}>
        <div className="text-lg sm:text-2xl font-semibold text-emerald-700">Account Info</div>
        <Separator className="my-2 sm:my-3 bg-zinc-200" />
        <Line>Available: {fmtCurrency(balance, currency)}</Line>
        <Line>Currency: {currency}</Line>
        <Line>Time: {new Date().toLocaleString()}</Line>
        <div className="mt-4 flex gap-2">
          <Button onClick={onCloseToMenu} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900">Close</Button>
        </div>
        <Hint>Use Close to return to the welcome screen.</Hint>
      </div>
    );
  }

  if (stage === "other") {
    return (
      <div className={`w-full px-2 pt-2 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} flex flex-col rounded-md`}>
        <div className="text-lg sm:text-2xl font-semibold text-emerald-700">Other Services</div>
        <Separator className="my-2 sm:my-3 bg-zinc-200" />
        <Line>Please visit the mobile app or branch for additional services.</Line>
        <div className="mt-4 flex gap-2">
          <Button onClick={onCloseToMenu} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 mb-32">Close</Button>
        </div>
        <Hint>Use Close to return to the welcome screen.</Hint>
      </div>
    );
  }

  // Input flows
  if (stage === "withdraw" || stage === "deposit" || stage === "transfer" || stage === "pinchange") {
    const title = stage === "withdraw" ? "Cash Withdrawal"
      : stage === "deposit" ? "Cash Deposit"
      : stage === "transfer" ? "Funds Transfer"
      : "Change PIN";
    const desc = stage === "withdraw" ? "Enter the amount to withdraw."
      : stage === "deposit" ? "Enter the amount to deposit."
      : stage === "transfer" ? "Enter recipient and amount."
      : "Enter a new 4–6 digit PIN.";

    const isMoney = stage === "withdraw" || stage === "deposit" || stage === "transfer";

    return (
      <div className={`w-full px-2 pt-2 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} flex flex-col rounded-md`}>
        <div className="flex items-center justify-between">
          <div className="text-lg sm:text-2xl font-semibold text-emerald-700">{title}</div>
          {busy && <div className="text-xs text-zinc-500">Processing…</div>}
        </div>
        <Separator className="my-2 sm:my-3 bg-zinc-200" />
        <div className="space-y-3">
          <div className="text-sm text-zinc-600">{desc}</div>

          {stage === "transfer" && (
            <>
              <Label className="text-sm">Recipient Account</Label>
              <Input
                value={toAccount}
                onChange={(e) => onChangeAccount(e.target.value)}
                placeholder="Account number"
                inputMode="numeric"
                autoFocus
              />
            </>
          )}

          {isMoney && (
            <>
              <Label className="text-sm">Amount ({fmtUSD(0).replace("0.00","")})</Label>
              <Input
                inputMode="numeric"
                value={inputAmount}
                onChange={(e) => onChangeAmount(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="Enter amount"
              />
              {stage === "withdraw" ? (
                <div className="text-xs text-zinc-500">Denominations of {fmtCurrency(DENOM, currency)} only.</div>
              ) : (
                <div className="text-xs text-zinc-500">Use keypad or type to enter amount.</div>
              )}
            </>
          )}

          {stage === "pinchange" && (
            <>
              <Label className="text-sm">New PIN</Label>
              <div className="relative">
                <Input
                  type={pinVisible ? "text" : "password"}
                  value={pin}
                  onChange={(e) => onChangePin(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Enter 4–6 digit PIN"
                  inputMode="numeric"
                />
                <button
                  type="button"
                  aria-label={pinVisible ? "Hide PIN" : "Show PIN"}
                  onClick={onTogglePinVisible}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-600 hover:text-zinc-800"
                >
                  {pinVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-xs text-zinc-500">Enter a 4–6 digit PIN.</div>
            </>
          )}
        </div>

        {/* Actions row on the screen */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={onSubmit}
            className={`${ATM_COLORS.primary} text-white disabled:opacity-60`}
            disabled={busy}
          >
            Submit
          </Button>
          <Button
            onClick={onCloseToMenu}
            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
            disabled={busy}
          >
            Close
          </Button>
        </div>

        <Separator className="my-3 bg-zinc-200" />
        <Hint>Use keypad: numbers to input, Enter to submit, Clear to erase, Cancel to go back.</Hint>
      </div>
    );
  }

  // Inline receipt
  if (stage === "receipt") {
    return (
      <div className={`w-full px-2 pt-2 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} flex flex-col rounded-md`}>
        <div className="text-lg sm:text-2xl font-semibold text-emerald-700">Receipt</div>
        <Separator className="my-2 sm:my-3 bg-zinc-200" />
        <pre className="whitespace-pre-wrap text-sm font-mono">{infoMessage || "No recent receipt"}</pre>
        <div className="mt-4 flex gap-2">
          <Button onClick={onCloseToMenu} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900">Close</Button>
        </div>
        <Hint>Use Close to return to the welcome screen.</Hint>
      </div>
    );
  }

  return (
    <div className={`w-full px-2 pt-2 sm:p-4 ${ATM_COLORS.screen} ${ATM_COLORS.screenText} flex flex-col rounded-md`}>
      <Line>Loading…</Line>
    </div>
  );
}




function FooterPanel({ onKeypad }) {
  return (
    <div className="w-full sm:pl-12 sm:pt-1 sm:pb-1">
      <div className="w-full">
        <NumericKeypad onKey={onKeypad} />
      </div>
    </div>
  );
}

function NumericKeypad({ onKey }) {
  const keys = ["1","2","3","4","5","6","7","8","9","Clear","0","Enter"];

  useEffect(() => {
    const onDown = (e) => {
      if (e.key >= "0" && e.key <= "9") onKey(e.key);
      if (e.key === "Enter") onKey("Enter");
      if (e.key === "Escape") onKey("Cancel");
      if (e.key === "Backspace") onKey("Clear");
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, [onKey]);

  return (
    // In NumericKeypad return
    <div className="grid grid-cols-3 gap-3 w-full">
      {keys.map((k) => (
        <Button
          key={k}
          onClick={() => onKey(k)}
          variant="secondary"
          aria-label={`key ${k}`}
          className={[
            "h-11 sm:h-12 text-base sm:text-base md:text-lg rounded-md shadow-sm",
            "px-3",
            k === "Enter" ? ATM_COLORS.enter : "",
            k === "Clear" ? ATM_COLORS.clear : "",
            k !== "Enter" && k !== "Clear" ? ATM_COLORS.secondary + " text-zinc-900" : "",
          ].join(" ")}
        >
          {k}
        </Button>
      ))}
      {/* <Button
        aria-label="key Cancel"
        onClick={() => onKey("Cancel")}
        className={`col-span-3 h-11 sm:h-12 md:h-12 text-base sm:text-base md:text-lg rounded-md ${ATM_COLORS.cancel}`}
      >
        Cancel
      </Button> */}
    </div>

  );
}



function SoftKeysLeft({ onSelect }) {
  return (
    <div className="flex flex-col w-full gap-12">
      {SOFT_LEFT.map((label, i) => (
        <Button
          key={label}
          onClick={() => onSelect(i)}
          variant="secondary"
          className={`${ATM_COLORS.secondary} text-zinc-900 min-h-12 md:min-h-16 text-sm md:text-sm font-medium rounded-lg w-full whitespace-normal break-words`}
          aria-label={`Soft key left ${label}`}
        >
          <span className="hidden md:inline">◀</span>
          <span className="leading-snug">{label}</span>
        </Button>
      ))}
    </div>
  );
}

function SoftKeysRight({ onSelect }) {
  return (
    <div className="flex flex-col w-full gap-12">
      {SOFT_RIGHT.map((label, i) => (
        <Button
          key={label}
          onClick={() => onSelect(i)}
          variant="secondary"
          className={`${ATM_COLORS.secondary} text-zinc-900 min-h-12 md:min-h-16 text-sm md:text-sm font-medium rounded-lg w-full whitespace-normal break-words`}
          aria-label={`Soft key right ${label}`}
        >
          <span className="leading-snug">{label}</span>
          <span className="hidden md:inline">▶</span>
        </Button>
      ))}
    </div>
  );
}

function SoftKeysMobile({ onSelect }) {
  const items = [
    ...SOFT_LEFT.map((label, i) => ({ side: "L", i, label })),
    ...SOFT_RIGHT.map((label, i) => ({ side: "R", i, label })),
  ];
  return (
    <div className="grid grid-cols-3 gap-2 md:hidden py-2">
      {items.map(({ side, i, label }) => (
        <Button
          key={`${side}-${label}`}
          onClick={() => (side === "L" ? onSelect.left(i) : onSelect.right(i))}
          variant="secondary"
          className="h-10 text-sm bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
          aria-label={`soft ${label}`}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}





function HardwarePanelRight() {
  return (
    // Mobile: row with tight gaps; md+: column
    <div className="flex flex-row md:flex-col items-stretch p-1.5 gap-1 h-auto md:h-full">
      {/* Card slot */}
      <div className="relative w-full md:w-auto flex-1">
        <div className="rounded-md p-1.5 md:p-2">
          {/* Bezel: smaller on mobile, larger on md+ */}
          <div className="relative h-28 md:h-48 rounded-md bg-gradient-to-b from-zinc-700 to-zinc-900 shadow ring-1 ring-zinc-800/40">
            <div className="absolute inset-x-0 top-0 h-[32%] md:h-[34%] rounded-t-md bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="absolute left-8 right-8 md:left-3.5 md:right-3.5 top-[40%] h-[15%] md:h-[23%] rounded-md bg-gradient-to-b from-black/90 via-black/75 to-black/40" />
            <div className="absolute right-2.5 md:right-3 top-2.5 md:top-3 h-3 w-3 md:h-3.5 md:w-3.5 rounded-full bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.75)]" />
          </div>
        </div>
        <div className="mt-0.5 text-[10px] text-center text-zinc-600">Card Slot</div>
      </div>

      {/* Receipt button: sits beside on mobile, bottom on md+ */}
      {/* <div className="flex md:sticky md:bottom-0">
        <Button
          variant="outline"
          onClick={onOpenReceipt}
          className="h-10 md:h-11 w-full gap-2 justify-center bg-gradient-to-b from-zinc-50 to-white border-zinc-300 text-zinc-700"
          aria-label="Open Receipt"
        >
          <Receipt className="h-4 w-4" />
          Receipt
        </Button> */}
      {/* </div> */}
    </div>
  );
}

// Main Component
export default function ATMDashboard() {
  const [balance, setBalance] = useState(0);
  const [pin, setPin] = useState("");
  const [stage, setStage] = useState("menu"); // menu | account | balance | withdraw | deposit | transfer | pinchange | other | receipt
  const [infoMessage, setInfoMessage] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const onTogglePinVisible = () => setPinVisible(v => !v);
  const [customerId] = useState(() => {
    try {
      const sd = JSON.parse(window.sessionStorage?.getItem("sessionData") || "{}");
      return sd?.customerId || "12345";
    } catch {
      return "UNKNOWN";
    }
  });
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const w = await getWallet();
        if (alive) {
          setBalance(w.amount);
          setCurrency(w.currency);
        }
      } catch (e) {
        // optional: show a non-blocking hint or keep defaults
      }
    })();
    return () => { alive = false; };
  }, []);

  const maskedPin = useMemo(() => "•".repeat(pin.length), [pin]);

  const resetFlow = () => {
    setPin("");
    setInputAmount("");
    setToAccount("");
  };

  const openReceipt = (title, lines = []) => {
    setInfoMessage([title, "", ...lines].join("\n"));
    setStage("receipt");
  };

  // Close -> return to welcome
  const onCloseToMenu = () => {
    resetFlow();
    setPinVisible(false);
    setStage("menu");
  };

  // Submit button calls the same logic as Enter
  const onSubmit = () => handleKey("Enter");

  // Update soft key handlers to set stage instead of opening dialogs/sheets
  const handleSoftLeft = async (index) => {
    const option = SOFT_LEFT[index];
    switch (option) {
      case "Account Info": {
        setBusy(true);
        try {
          const w = await getWallet();
          setBalance(w.amount);
          setCurrency(w.currency);
          // Show Account Info on screen (not receipt) per your request
          setStage("account");
        } finally { setBusy(false); }
        break;
      }
      case "Withdraw":
        setStage("withdraw");
        break;
      case "Deposit":
        setStage("deposit");
        break;
      default: break;
    }
  };

  const handleSoftRight = async (index) => {
    const option = SOFT_RIGHT[index];
    switch (option) {
      case "PIN change":
        setStage("pinchange");
        break;
      case "Balance": {
        setBusy(true);
        try {
          const w = await getWallet();
          setBalance(w.amount);
          setCurrency(w.currency);
          // Show Balance on screen
          setStage("balance");
        } finally { setBusy(false); }
        break;
      }
      case "Other Services":
        setStage("other");
        break;
      default: break;
    }
  };

  const handleOption = (label) => {
    const leftIdx = SOFT_LEFT.indexOf(label);
    if (leftIdx !== -1) return handleSoftLeft(leftIdx);
    const rightIdx = SOFT_RIGHT.indexOf(label);
    if (rightIdx !== -1) return handleSoftRight(rightIdx);
  };
  

  const handleKey = async (k) => {
    if (k === "Cancel") {
      resetFlow();
      setStage("menu");
      return;
    }
    if (k === "Clear") {
      if (stage === "pinchange") setPin("");
      else setInputAmount("");
      return;
    }
    if (k === "Enter") {
      if (stage === "withdraw") {
        const amt = Number(inputAmount);
        if (!isValidAmount(amt)) return;
        if (amt % DENOM !== 0) {
          openReceipt("Withdrawal Failed", [`Amount must be in ${fmtCurrency(DENOM, currency)} denominations.`]);
        } else if (amt < MIN_WITHDRAW) {
          openReceipt("Withdrawal Failed", [`Minimum per withdrawal is ${fmtCurrency(MIN_WITHDRAW, currency)}.`]);
        } else if (amt > MAX_WITHDRAW) {
          openReceipt("Withdrawal Failed", [`Maximum per withdrawal is ${fmtCurrency(MAX_WITHDRAW, currency)}.`]);
        } else if (amt > balance) {
          openReceipt("Withdrawal Failed", ["Insufficient funds."]);
        } else {
          setBusy(true);
          try {
            const notifyRes = await sendWithdrawNotify({ customerId, amount: amt });
            const sessionId = notifyRes.sessionId;

            const { status } = await pollApproval({
              sessionId,
              fetchStatus: getApprovalStatus,
            });
            if (status === "APPROVED") {
              await postWithdraw(amt);
              const w = await getWallet();
              setBalance(w.amount);
              setCurrency(w.currency);
              openReceipt("Withdrawal Successful", [
                `Dispensed:   ${fmtCurrency(amt, w.currency)}`,
                `New Balance: ${fmtCurrency(w.amount, w.currency)}`,
              ]);
            }
            else if (status === "DECLINED") {
              openReceipt("Withdrawal Declined", ["Approval was declined in mobile app."]);
            } else if (status === "EXPIRED" || status === "TIMEOUT") {
              openReceipt("Withdrawal Timeout", ["Approval request expired. Please try again."]);
            } else {
              openReceipt("Withdrawal Failed", ["Unexpected approval status."]);
            }
          } catch (err) {
            openReceipt("Withdrawal Error", [String(err?.message || err) ]);
          } finally {
            setBusy(false);
          }
        }
        resetFlow();
        setStage("menu");
        return;
      } else if (stage === "deposit") {
        const amt = Number(inputAmount);
        if (!isValidAmount(amt)) return;
        setBalance((b) => b + amt);
        openReceipt("Deposit Successful", [
          `Deposited:   ${fmtUSD(amt)}`,
          `New Balance: ${fmtUSD(balance + amt)}`,
        ]);
        resetFlow();
        setStage("menu");
      } else if (stage === "transfer") {
        const amt = Number(inputAmount);
        if (!isValidAmount(amt) || !toAccount.trim()) return;
        if (amt > balance) {
          openReceipt("Transfer Failed", ["Insufficient funds."]);
        } else {
          setBalance((b) => b - amt);
          openReceipt("Transfer Successful", [
            `To:          ${toAccount}`,
            `Amount:      ${fmtUSD(amt)}`,
            `New Balance: ${fmtUSD(balance - amt)}`,
          ]);
        }
        resetFlow();
        setStage("menu");
      } else if (stage === "pinchange") {
        if (pin.length < 4 || pin.length > 6) {
          openReceipt("PIN Change Failed", ["PIN must be 4–6 digits."]);
        } else {
          openReceipt("PIN Changed", ["PIN updated successfully."]);
        }
        resetFlow();
        setStage("menu");
      }
      return;
    }
    if (/^\d$/.test(k)) {
      if (stage === "pinchange") {
        if (pin.length < 6) setPin((p) => p + k);
      } else {
        if (inputAmount.length < 7) setInputAmount((s) => (s === "0" ? k : s + k));
      }
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden bg-gradient-to-b ${ATM_COLORS.room} text-zinc-900 grid grid-rows-[auto_1fr]`}>
      {/* Header row (auto height) */}
      <div className={`w-full border-b border-zinc-300 ${ATM_COLORS.bezelAccent}`}>
        <AtmHeader />
      </div>
      {/* Main row  */}
      <div className="h-full grid grid-rows-[1fr_auto]">
        {/* Row 1: content + hardware */}
        <div className="grid grid-cols-12 gap-3 p-2 sm:p-3 md:p-4">
          {/* ATM content (soft-left, screen, soft-right) */}
          <div className="col-span-12 lg:col-span-9 h-full">
            <div className="grid grid-cols-12 h-full">
              {/* Soft keys left */}
              <div className="col-span-2 hidden md:flex items-stretch justify-stretch">
                <SoftKeysLeft onSelect={handleSoftLeft} />
              </div>

              {/* Screen body widened to 8 cols */}
              <div className="col-span-12 md:col-span-8 flex md:px-4">
                <div className="w-full flex flex-col">
                  {/* Mobile soft keys bar just above screen on small */}
                  <SoftKeysMobile
                    onSelect={{ left: handleSoftLeft, right: handleSoftRight }}
                  />
                  <div className="flex-1 min-h-0">
                    <ScreenBody
                      stage={stage}
                      balance={balance}
                      currency={currency}
                      inputAmount={inputAmount}
                      toAccount={toAccount}
                      pin={pin}
                      maskedPin={maskedPin}
                      infoMessage={infoMessage}
                      onSoftOption={handleOption}
                      onKey={handleKey}
                      busy={busy}
                      onChangeAmount={setInputAmount}
                      onChangeAccount={setToAccount}
                      onChangePin={setPin}
                      onSubmit={onSubmit}
                      onCloseToMenu={onCloseToMenu}
                      pinVisible={pinVisible}
                      onTogglePinVisible={onTogglePinVisible}
                    />
                  </div>
                </div>
              </div>

              {/* Soft keys right */}
              <div className="col-span-2 hidden md:flex items-stretch justify-stretch">
                <SoftKeysRight onSelect={handleSoftRight} />
              </div>
            </div>
          </div>

          {/* Hardware panel */}
          <div className="col-span-12 lg:col-span-3 h-full">
            <div className="h-full min-h-0 overflow-hidden">
              <HardwarePanelRight />
            </div>
          </div>
        </div>

        {/* Row 2: footer keypad strip */}
        <div className="grid grid-cols-12 gap-3 p-2 sm:p-3 md:p-4 border-t border-zinc-200">
          {/* Spacer on left to visually align with content; hide on small */}
          <div className="hidden lg:block lg:col-span-7" />
          {/* Keypad on right; shorter buttons, full width within its cell */}
          <div className="col-span-12 lg:col-span-5">
            <FooterPanel onKeypad={handleKey} />
          </div>
        </div>
      </div>

    </div>
  );
  
}

