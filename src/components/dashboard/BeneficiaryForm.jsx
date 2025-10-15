import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function BeneficiaryForm({ token, onAdd }) {
  const [form, setForm] = useState({ name: "", nickname: "", iban: "", accountNumber: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.name || !form.nickname || !form.iban || !form.accountNumber) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/iam/beneficiaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to add beneficiary");

      onAdd(data); // update parent state
      setForm({ name: "", nickname: "", iban: "", accountNumber: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
      <Input name="nickname" placeholder="Nickname" value={form.nickname} onChange={handleChange} />
      <Input name="iban" placeholder="IBAN" value={form.iban} onChange={handleChange} />
      <Input
        name="accountNumber"
        placeholder="Account Number"
        value={form.accountNumber}
        onChange={handleChange}
      />
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Adding..." : "Add Beneficiary"}
      </Button>
    </div>
  );
}
