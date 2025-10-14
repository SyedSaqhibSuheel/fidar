import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import NumericKeypad from "./NumericKeypad";
import { fmtUSD } from "./atm-utils";
import { ATM_COLORS } from "./atm-constants";

export default function OperationDialog({
  open,
  stage,
  inputAmount,
  toAccount,
  pin,
  maskedPin,
  balance,
  limits,
  onChangeAmount,
  onChangeAccount,
  onChangePin,
  onConfirm,
  onClose,
  onKey,
  busy
}) {
  const { MIN_WITHDRAW, MAX_WITHDRAW, DENOM } = limits;
  const amt = Number(inputAmount || "0");
  const isWithdraw = stage === "withdraw";
  const invalidDenom = isWithdraw && amt > 0 && amt % DENOM !== 0;
  const exceedsMax = isWithdraw && amt > MAX_WITHDRAW;
  const belowMin = isWithdraw && amt > 0 && amt < MIN_WITHDRAW;
  const exceedsBal = isWithdraw && amt > balance;

  const confirmDisabled = (() => {
    if (stage === "withdraw") {
      const a = Number(inputAmount);
      if (!a || !Number.isFinite(a)) return true;
      if (a % DENOM !== 0) return true;
      if (a < MIN_WITHDRAW || a > MAX_WITHDRAW) return true;
      if (a > balance) return true;
      return false;
    }
    if (stage === "deposit") {
      const a = Number(inputAmount);
      return !a || !Number.isFinite(a);
    }
    if (stage === "transfer") {
      const a = Number(inputAmount);
      return !a || !Number.isFinite(a) || !toAccount.trim() || a > balance;
    }
    if (stage === "pinchange") {
      return pin.length < 4 || pin.length > 6;
    }
    return false;
  })();

  const body = (() => {
    if (stage === "withdraw" || stage === "deposit") {
      return (
        <div className="space-y-3">
          <Label className="text-sm">Amount ({fmtUSD(0).replace("0.00","")})</Label>
          <Input
            inputMode="numeric"
            value={inputAmount}
            onChange={(e) => onChangeAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Enter amount"
          />
          <div className="text-xs text-muted-foreground">
            {isWithdraw ? `Denominations of ${fmtUSD(DENOM)} only.` : "Any amount allowed."}
          </div>
          <div className="space-y-1">
            {invalidDenom && <div className="text-amber-500 text-xs">Must be multiple of {fmtUSD(DENOM)}.</div>}
            {belowMin && <div className="text-amber-500 text-xs">Minimum {fmtUSD(MIN_WITHDRAW)}.</div>}
            {exceedsMax && <div className="text-amber-500 text-xs">Maximum {fmtUSD(MAX_WITHDRAW)} per transaction.</div>}
            {exceedsBal && <div className="text-red-500 text-xs">Insufficient funds.</div>}
          </div>
          <NumericKeypad onKey={onKey} />
        </div>
      );
    }
    if (stage === "transfer") {
      return (
        <div className="space-y-3">
          <Label className="text-sm">Recipient Account</Label>
          <Input value={toAccount} onChange={(e) => onChangeAccount(e.target.value)} placeholder="Account number" />
          <Label className="text-sm">Amount ({fmtUSD(0).replace("0.00","")})</Label>
          <Input
            inputMode="numeric"
            value={inputAmount}
            onChange={(e) => onChangeAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Enter amount"
          />
          <div className="text-xs text-muted-foreground">Use keypad or type to enter amount.</div>
          <NumericKeypad onKey={onKey} />
        </div>
      );
    }
    if (stage === "pinchange") {
      return (
        <div className="space-y-3">
          <Label className="text-sm">New PIN</Label>
          <Input
            type="password"
            value={pin}
            onChange={(e) => onChangePin(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Enter 4–6 digit PIN"
          />
          <div className="text-lg tracking-widest">{maskedPin}</div>
          <NumericKeypad onKey={onKey} />
        </div>
      );
    }
    return null;
  })();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage === "withdraw" && "Cash Withdrawal"}
            {stage === "deposit" && "Cash Deposit"}
            {stage === "transfer" && "Funds Transfer"}
            {stage === "pinchange" && "Change PIN"}
          </DialogTitle>
          <DialogDescription>
            {stage === "withdraw" && "Enter the amount to withdraw."}
            {stage === "deposit" && "Enter the amount to deposit."}
            {stage === "transfer" && "Enter recipient and amount."}
            {stage === "pinchange" && "Enter a new 4–6 digit PIN."}
          </DialogDescription>
        </DialogHeader>
        {body}
        <DialogFooter>
            <Button variant="ghost" onClick={() => onClose(false)} disabled={busy}>Close</Button>
            <Button onClick={onConfirm} disabled={busy || confirmDisabled} className={`${ATM_COLORS.primary} text-white disabled:opacity-60`}>
                {busy ? "Processing..." : "Confirm"}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
