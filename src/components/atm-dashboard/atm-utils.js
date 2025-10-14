export const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const fmtCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(amount || 0));


export const isValidAmount = (amt) => amt && amt > 0 && Number.isFinite(amt);


export async function pollApproval({ sessionId, intervalMs = 2000, timeoutMs = 300000, fetchStatus }) {
  const start = Date.now();
  /* eslint-disable no-constant-condition */
  while (true) {
    const { status } = await fetchStatus(sessionId);
    if (status === "APPROVED") return { status };
    if (status === "DECLINED" || status === "EXPIRED") return { status };
    if (Date.now() - start > timeoutMs) return { status: "TIMEOUT" };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
