"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { LoopingVideoBackground } from "@/components/ui/LoopingVideoBackground";
import { useToast } from "@/contexts/ToastContext";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setShowPage(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      showSuccess('Login berhasil! Mengalihkan...');

      const roleRouteMap: Record<string, string> = {
        'HRManager': '/hr-manager/dashboard',
        'HRStaff': '/hr-staff/dashboard',
        'Recruiter': '/recruiter/dashboard',
        'Employee': '/employee/dashboard',
      };

      const route = roleRouteMap[data.user.role] || '/employee/dashboard';
      setTimeout(() => router.push(route), 500);
    } catch (error: any) {
      showError(error.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen relative flex items-center justify-center transition-opacity duration-300 ${showPage ? 'page-enter opacity-100' : 'opacity-0'}`}>
      {/* Video Background */}
      <LoopingVideoBackground videoSrc="/bg-video.mp4" />

      {/* Centered Login Form */}
      <div className="relative z-10 w-full max-w-[480px] px-4">
        {/* Logo with Line */}
        <div className="flex flex-col items-center gap-4 animate-fade-in relative z-20">
          <div className="relative w-32 h-32">
            {/* Circular Logo */}
            <div className="w-full h-full bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg overflow-hidden relative z-20">
              <Image src="/favicon - Copy.png" alt="LSP Gatensi Logo" width={112} height={112} className="object-contain" />
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative">
          {/* Main Card */}
          <div className="relative bg-white backdrop-blur-sm rounded-2xl p-5 border border-white/10 -translate-y-14" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
            {/* Header */}
            <div className="mb-5 mt-12 text-center">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Selamat Datang!</h2>
              <p className="text-slate-600 text-sm">
                Masuk untuk mengakses HR Management System
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <label className="text-xs font-semibold text-slate-700">Account</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Masukkan account ID / email"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-10 border border-slate-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4" />
                  <span>Ingat saya</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Masuk...
                  </div>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="mt-4 text-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <p className="text-xs text-slate-500">
                © 2026 LSP Gatensi. All rights reserved.
              </p>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}
