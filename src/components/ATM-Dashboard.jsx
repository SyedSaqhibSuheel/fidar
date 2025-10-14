import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import AtmHeader from "./atm-dashboard/AtmHeader";
import { SoftKeysLeft, SoftKeysRight } from "./atm-dashboard/SoftKeys";
import AtmScreen from "./atm-dashboard/AtmScreen";
import FooterPanel from "./atm-dashboard/FooterPanel";
import OperationDialog from "./atm-dashboard/OperationDialog";
import ReceiptSheet from "./atm-dashboard/RecieptSheet";
import { fmtCurrency, fmtUSD, isValidAmount, pollApproval } from "./atm-dashboard/atm-utils";
import { ATM_COLORS, SOFT_LEFT, SOFT_RIGHT, MIN_WITHDRAW, MAX_WITHDRAW, DENOM } from "./atm-dashboard/atm-constants";
import { sendWithdrawNotify, getApprovalStatus, postWithdraw, getWallet } from "./atm-dashboard/atm-apis";

export default function ATMDashboard() {
  const [balance, setBalance] = useState(0);
  const [pin, setPin] = useState("");
  const [stage, setStage] = useState("menu");
  const [inputAmount, setInputAmount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [dispensing, setDispensing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [customerId] = useState(() => {
    try {
      const sd = JSON.parse(localStorage.getItem("sessionData") || "{}");
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
    setMessage([title, "", ...lines].join("\n"));
    setSheetOpen(true);
  };

  const handleSoftLeft = async (index) => {
    const option = SOFT_LEFT[index];
    switch (option) {
      case "Balance": {
        setBusy(true);
        try {
          const w = await getWallet();
          setBalance(w.amount);
          setCurrency(w.currency);
          openReceipt("Balance Inquiry", [
            `Available:   ${fmtCurrency(w.amount, w.currency)}`,
            `Ledger:      ${fmtCurrency(w.amount, w.currency)}`,
            `Time:        ${new Date().toLocaleString()}`,
            `Ref:         ${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          ]);
        } finally { setBusy(false); }
        break;
      }
      case "Withdraw":
        setStage("withdraw");
        setDialogOpen(true);
        break;
      case "Deposit":
        setStage("deposit");
        setDialogOpen(true);
        break;
      case "Mini stmt":
        setStage("statement");
        openReceipt("Mini Statement", [
          "Date        Type   Amount",
          "----------  -----  --------",
          "10/01 12:11 ATM    -" + fmtUSD(1000),
          "09/28 18:44 POS    -" + fmtUSD(55),
          "09/27 09:02 DEP    +" + fmtUSD(200),
          "09/26 21:19 ACH    -" + fmtUSD(29.9),
          "09/23 15:03 REF    +" + fmtUSD(12),
        ]);
        break;
      default:
        break;
    }
  };

  const handleSoftRight = (index) => {
    const option = SOFT_RIGHT[index];
    switch (option) {
      case "Transfer":
        setStage("transfer");
        setDialogOpen(true);
        break;
      case "PIN change":
        setStage("pinchange");
        setDialogOpen(true);
        break;
      case "Help":
        setStage("help");
        openReceipt("Help", [
          "Insert card → Enter PIN",
          "Use side buttons for options",
          "Use keypad: Clear / Enter / Cancel",
        ]);
        break;
      case "Exit":
        openReceipt("Session Ended", [
          "Please take your card.",
          "Thank you for banking with us.",
        ]);
        break;
      default:
        break;
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
      setDialogOpen(false);
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
            // 1) send notification
            const notifyRes = await sendWithdrawNotify({ customerId, amount: amt });
            const sessionId = notifyRes.sessionId;

            // 2) poll approval
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
        setDialogOpen(false);
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
        setDialogOpen(false);
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
        setDialogOpen(false);
        setStage("menu");
      } else if (stage === "pinchange") {
        if (pin.length < 4 || pin.length > 6) {
          openReceipt("PIN Change Failed", ["PIN must be 4–6 digits."]);
        } else {
          openReceipt("PIN Changed", ["PIN updated successfully."]);
        }
        resetFlow();
        setDialogOpen(false);
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
    <div className={`fixed inset-0 min-h-dvh w-full bg-gradient-to-br ${ATM_COLORS.room} flex items-center justify-center`}>
      <Card className="w-full h-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] border border-zinc-800 overflow-hidden rounded-2xl grid grid-rows-[auto,1fr,auto]">
        <AtmHeader />

        <CardContent className={`${ATM_COLORS.bezel} p-0 sm:p-4 min-h-0 h-full overflow-y-auto`}>
          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-0 min-h-0 h-full">
            <SoftKeysLeft onSelect={handleSoftLeft} />
            <AtmScreen balance={balance} currency={currency} onSelectOption={handleOption} />
            <SoftKeysRight onSelect={handleSoftRight} />
          </div>
        </CardContent>

        <CardFooter className={`${ATM_COLORS.bezel} p-4 sm:p-5 md:z-10`}>
          <FooterPanel
            dispensing={dispensing}
            onSoftLeft={handleSoftLeft}
            onSoftRight={handleSoftRight}
            onOpenReceipt={() => setSheetOpen(true)}
            onKeypad={handleKey}
          />
        </CardFooter>
      </Card>


      <OperationDialog
        open={dialogOpen}
        stage={stage}
        inputAmount={inputAmount}
        toAccount={toAccount}
        pin={pin}
        maskedPin={maskedPin}
        balance={balance}
        limits={{ MIN_WITHDRAW, MAX_WITHDRAW, DENOM }}
        onChangeAmount={setInputAmount}
        onChangeAccount={setToAccount}
        onChangePin={setPin}
        onConfirm={() => handleKey("Enter")}
        onClose={(open) => { if (!open) { setDialogOpen(false); setStage("menu"); } }}
        onKey={handleKey}
        busy={busy}
      />


      <ReceiptSheet open={sheetOpen} onOpenChange={setSheetOpen} message={message} />
    </div>
  );
}
