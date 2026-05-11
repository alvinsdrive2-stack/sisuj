"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { getFilteredMenus } from "@/lib/rbac-config";
import Image from "next/image";

interface DashboardSidebarProps {
  userRole: string;
  isCollapsed?: boolean;
}

export default function DashboardSidebar({
  userRole,
  isCollapsed = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = getFilteredMenus(userRole);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-16 left-0 z-30
          h-[calc(100vh-4rem)] flex flex-col
          transition-all duration-300
          ${isCollapsed ? "w-20" : "w-72"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Container */}
        <div className="flex flex-col h-full bg-white/90 border-r border-slate-200/50 backdrop-blur-sm">

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                Navigation
              </p>
            )}

            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.path || pathname.startsWith(item.path + "/");

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-200 group relative
                        ${isActive
                          ? "bg-primary text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }
                        ${isCollapsed ? "justify-center" : ""}
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full animate-blue-pulse" />
                      )}
                      <div className={`
                        w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                        ${isActive
                          ? "bg-white/20"
                          : "bg-slate-100 group-hover:bg-slate-200"
                        }
                      `}>
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-600"}`} />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="text-sm font-medium">{item.title}</span>
                          {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-80" />}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Info - Version & Copyright */}
          <div className="p-4 text-center">
            {!isCollapsed && (
              <div className="px-2 py-2 space-y-1">
                <p className="text-xs font-semibold text-slate-600">Version 1.0</p>
                <p className="text-[10px] text-slate-400">Copyright © 2026 LSP Gatensi</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
