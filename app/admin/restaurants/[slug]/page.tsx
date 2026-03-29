"use client";

import { useParams } from "next/navigation";
import AdminAuthGate from "@/components/admin/AdminAuthGate";
import AdminRestaurantDetail from "@/components/admin/AdminRestaurantDetail";

export default function AdminRestaurantPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  return (
    <AdminAuthGate
      title="Restaurant Detail"
      subtitle="Review activity, export contacts, check the public page, and keep your private sales notes in one place."
    >
      {(password) =>
        slug ? <AdminRestaurantDetail slug={slug} password={password} /> : null
      }
    </AdminAuthGate>
  );
}
