import { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  DollarSign,
  Settings,
  UserCircle,
  UserStar,
} from "lucide-react"

// HR Role Types
export type UserRole =
  | "superadmin"
  | "HR Manager"
  | "HR Staff"
  | "Employee"

// Menu Item Interface
export interface MenuItem {
  title: string
  path: string
  icon: LucideIcon
}

// Role Configuration
export interface RoleConfig {
  name: UserRole
  layout: "dashboard-hr-manager" | "dashboard-hr-staff" | "dashboard-employee"
  defaultRoute: string
  menus: MenuItem[]
}

// HR Role-based Configuration
export const roleConfig: Partial<Record<UserRole, RoleConfig>> = {
  "HR Manager": {
    name: "HR Manager",
    layout: "dashboard-hr-manager",
    defaultRoute: "/hr-manager/dashboard",
    menus: [
      { title: "Dashboard", path: "/hr-manager/dashboard", icon: LayoutDashboard },
      { title: "Karyawan", path: "/hr-manager/employees", icon: Users },
      { title: "Absensi", path: "/hr-manager/attendance", icon: ClipboardCheck },
      { title: "Payroll", path: "/hr-manager/payroll", icon: DollarSign },
      { title: "Penilaian", path: "/hr-manager/asesors", icon: UserStar },
      { title: "Pengaturan", path: "/hr-manager/settings", icon: Settings },
    ],
  },
  "HR Staff": {
    name: "HR Staff",
    layout: "dashboard-hr-staff",
    defaultRoute: "/hr-staff/dashboard",
    menus: [
      { title: "Dashboard", path: "/hr-staff/dashboard", icon: LayoutDashboard },
      { title: "Karyawan", path: "/hr-staff/employees", icon: Users },
      { title: "Absensi", path: "/hr-staff/attendance", icon: ClipboardCheck },
    ],
  },
  "Employee": {
    name: "Employee",
    layout: "dashboard-employee",
    defaultRoute: "/employee/dashboard",
    menus: [
      { title: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
      { title: "Profil Saya", path: "/employee/profile", icon: UserCircle },
      { title: "Absensi", path: "/employee/attendance", icon: ClipboardCheck },
    ],
  },
};

// Helper functions
export function getRoleConfig(roleName: string): RoleConfig | null {
  return roleConfig[roleName as UserRole] || null;
}

export function getFilteredMenus(roleName: string): MenuItem[] {
  const config = getRoleConfig(roleName);
  if (!config) return [];
  return config.menus;
}
