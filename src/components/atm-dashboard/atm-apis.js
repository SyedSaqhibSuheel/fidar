const BASE = "http://localhost:8080/iam";

const getToken = () => {
  const raw = localStorage.getItem("AtmsessionData");
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    console.log("PARSED", parsed)
    return parsed?.token || "";
  } catch {
    return "";
  }
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export async function sendWithdrawNotify({ customerId, amount }) {
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
  return res.json(); // { sessionId, expiresAt, ttlSeconds, ... }
}

export async function getApprovalStatus(sessionId) {
  const res = await fetch(`${BASE}/api/approval/status/${sessionId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Status failed: ${res.status}`);
  return res.json(); // { status: "PENDING"|"APPROVED"|"DECLINED"|"EXPIRED" }
}

export async function postWithdraw(amount) {
  const res = await fetch(`${BASE}/transactions/withdraw`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ amount : String(amount) }),
  });
  if (!res.ok) throw new Error(`Withdraw failed: ${res.status}`);
  return res.json();
}

export async function getWallet() {
  const res = await fetch(`${BASE}/wallets`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Wallet failed: ${res.status}`);
  const data = await res.json();
  // normalized shape
  const amount = Number(data?.balance?.amount ?? 0);
  const currency = data?.balance?.currency ?? "USD";
  return { amount, currency, raw: data };
}


