"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      // Not logged in, redirect to login
      router.push("/login");
      return;
    }

    // Logged in, redirect based on role
    const user = JSON.parse(userStr);
    const roleRouteMap: Record<string, string> = {
      HRManager: "/hr-manager/dashboard",
      HRStaff: "/hr-staff/dashboard",
      Recruiter: "/recruiter/dashboard",
      Employee: "/employee/dashboard",
    };

    const route = roleRouteMap[user.role] || "/employee/dashboard";
    router.push(route);
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600">Loading...</p>
      </div>
    </div>
  );
}
