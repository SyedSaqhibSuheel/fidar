import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import BeneficiaryForm from "./BeneficiaryForm";

export default function QuickActionsGrid() {
  const token = localStorage.getItem("authToken");
  const [beneficiaries, setBeneficiaries] = useState([]);

  useEffect(() => {
    if (!token) return;
    const fetchBeneficiaries = async () => {
      try {
        const res = await fetch("http://localhost:8080/iam/beneficiaries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch beneficiaries");
        const data = await res.json();
        setBeneficiaries(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBeneficiaries();
  }, [token]);

  const handleTransfer = async () => {
    if (beneficiaries.length === 0) return alert("No beneficiaries added yet.");
    const targetIndex = prompt(
      `Select beneficiary index (0-${beneficiaries.length - 1}):\n` +
        beneficiaries.map((b, i) => `${i}: ${b.nickname} (${b.name})`).join("\n")
    );
    const amount = prompt("Enter amount:");
    const purpose = prompt("Enter purpose:");
    const target = beneficiaries[Number(targetIndex)];
    if (!target || !amount || !purpose) return;

    try {
      const res = await fetch("http://localhost:8080/iam/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetId: target.id, amount: Number(amount), purpose }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Transfer failed");
      alert(`Transferred $${amount} to ${target.nickname}`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Add Beneficiary */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="
            h-16 lg:h-20 flex flex-col items-center justify-center gap-1.5
            bg-white border border-pink-300 text-pink-600 rounded-2xl shadow-lg
            transition-all duration-300
            hover:bg-pink-50 hover:shadow-xl hover:-translate-y-1 active:translate-y-0
          ">
            <FontAwesomeIcon icon={faPlus} className="h-5 w-5" /> Add Beneficiary
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Beneficiary</DialogTitle>
          </DialogHeader>
          <BeneficiaryForm
            token={token}
            onAdd={(newBen) => setBeneficiaries((prev) => [...prev, newBen])}
          />
          {beneficiaries.length > 0 && (
            <ul className="mt-4 max-h-40 overflow-y-auto space-y-1 border-t pt-2">
              {beneficiaries.map((b, idx) => (
                <li key={b.id || idx} className="text-sm text-gray-700">
                  {b.nickname} ({b.name})
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer */}
      <Button
        onClick={handleTransfer}
        className="
          h-16 lg:h-20 flex flex-col items-center justify-center gap-1.5
          bg-white border border-purple-300 text-purple-600 rounded-2xl shadow-lg
          transition-all duration-300
          hover:bg-purple-50 hover:shadow-xl hover:-translate-y-1 active:translate-y-0
        "
      >
        <FontAwesomeIcon icon={faRightLeft} className="h-5 w-5 mr-1" /> Transfer
      </Button>
    </div>
  );
}
