"use client";

import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminOverview from "@/components/admin/AdminOverview";

export default function AdminPage() {
  return (
    <AdminAuthGate
      title="TableFlow Founder Dashboard"
      subtitle="See every restaurant, watch activity across the whole pipeline, and follow up with the owners who need a push."
    >
      {(password) => <AdminOverview password={password} />}
    </AdminAuthGate>
  );
}
