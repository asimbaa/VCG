import React from "react";
import { PaymentStatusOverlay } from "./PaymentStatusOverlay";

export function BankDashboard({ user }: { user: any }) {
  return (
    <>
      <PaymentStatusOverlay />
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-black mb-4">Valourian Capital</h1>
        <p className="text-slate-400 max-w-lg text-center">
          The legacy banking dashboard is currently undergoing migration to the Sovereign OS v9 infrastructure. Please use the Valourian Dashboard.
        </p>
      </div>
    </>
  );
}
