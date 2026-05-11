"use client";

import { ReactNode } from "react";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import { LoopingVideoBackground } from "@/components/ui/LoopingVideoBackground";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: string;
  userName?: string;
}

export default function DashboardLayout({
  children,
  userRole,
  userName = "User",
}: DashboardLayoutProps) {
  return (
    <>
      {/* Video Background */}
      <LoopingVideoBackground videoSrc="/bg-video.mp4" />

      <div className="min-h-screen flex flex-col">
        {/* DashboardNavbar - Fixed at top */}
        <DashboardNavbar userName={userName} userRole={userRole} />

        {/* Main Content Area */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <DashboardSidebar userRole={userRole} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="bg-white/95 rounded-2xl backdrop-blur-sm shadow-xl border border-white/50 p-6 min-h-[calc(100vh-120px)] page-enter">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
