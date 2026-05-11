"use client";

import { useState } from "react";
import { LogOut, Bell, Menu, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

interface DashboardNavbarProps {
  userName?: string;
  userRole?: string;
}

export default function DashboardNavbar({
  userName = "User",
  userRole = "Employee",
}: DashboardNavbarProps) {
  const router = useRouter();
  const { showSuccess } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    showSuccess("Logout berhasil!");
    setTimeout(() => router.push("/login"), 500);
    setIsLoggingOut(false);
  };

  const handleLogoClick = () => {
    router.push("/hr-manager/dashboard");
  };

  return (
    <header className="bg-white sticky top-0 z-50 h-16 overflow-visible">
      <div className="w-full h-full">
        {/* Top Bar - Logo, Desktop Right Section, Mobile Toggle */}
        <div className="flex items-center justify-between h-full shadow-xl z-[100000] mx-2">
          {/* Left: Logo */}
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="w-[230px] h-[110px] flex items-center justify-center overflow-hidden cursor-pointer transition-transform duration-20"
              title="Kembali ke Dashboard"
            >
              <Image
                src="/logo.png"
                alt="LSP Gatensi Logo"
                width={170}
                height={150}
                className="hover:scale-105 -translate-x-4 w-[170px] h-[150px] object-contain"
              />
            </button>
          </div>

          {/* Desktop: Right section */}
          <div className="hidden md:flex items-center gap-3 pr-4">
            {/* User Info */}
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-slate-800">{userName}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-300 mx-2"></div>

            {/* Notifications */}
            <button
              className="p-2 rounded-lg hover:bg-slate-100 relative"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 rounded-lg hover:bg-red-50 text-red-800 hover:text-red-600"
              title="Logout"
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile: Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-fade-in">
            <div className="flex flex-col gap-3">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border-2 border-slate-200">
                  <span className="text-lg font-bold text-primary">{userInitials}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{userName}</p>
                  <p className="text-xs text-slate-500">{userRole}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 py-2 items-center">
                <button className="flex-1 relative py-2 px-3 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifikasi
                  <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
                >
                  {isLoggingOut ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
