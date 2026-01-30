import { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  ClipboardCheck,
  Shield,
  Settings,
  UserCheck,
  Upload,
  FileCheck as FileCheckIcon,
  Activity,
  PenTool
} from "lucide-react"

// Role Types
export type UserRole =
  | "Admin LSP"
  | "Direktur LSP"
  | "Manajer Sertifikasi"
  | "Admin TUK"
  | "Asesor"
  | "Asesi"
  | "Komtek"

// Permission Types
export type Permission =
  | "view_all_assessment_status"
  | "view_reports"
  | "view_all_reports"
  | "monitor_assessment"
  | "verify_personal_documents"
  | "submit_verification_status"
  | "start_pra_assessment"
  | "start_assessment"
  | "view_assigned_assesi"
  | "submit_assessment_result"
  | "confirm_personal_data"
  | "join_assessment"
  | "sign_document"
  | "view_signed_documents"
  | "view_unsigned_documents"

// Menu Item Interface
export interface MenuItem {
  title: string
  path: string
  icon: LucideIcon
}

// Role Configuration
export interface RoleConfig {
  name: UserRole
  layout: "dashboard-admin" | "dashboard-executive" | "dashboard-manager" | "dashboard-asesor" | "dashboard-asesi"
  defaultRoute: string
  permissions: Permission[]
  menus: MenuItem[]
}

// Role-based Configuration
export const roleConfig: Record<UserRole, RoleConfig> = {
  "Admin LSP": {
    name: "Admin LSP",
    layout: "dashboard-admin",
    defaultRoute: "/admin-lsp/dashboard",
    permissions: ["view_all_assessment_status", "view_reports"],
    menus: [
      {
        title: "Dashboard",
        path: "/admin-lsp/dashboard",
        icon: LayoutDashboard
      },
      {
        title: "Laporan Sertifikasi",
        path: "/admin-lsp/reports",
        icon: FileText
      },
      {
        title: "Manajemen User",
        path: "/admin-lsp/users",
        icon: Users
      },
      {
        title: "Pengaturan",
        path: "/admin-lsp/settings",
        icon: Settings
      }
    ]
  },
  "Direktur LSP": {
    name: "Direktur LSP",
    layout: "dashboard-executive",
    defaultRoute: "/direktur/tandatangan",
    permissions: ["sign_document", "view_signed_documents", "view_unsigned_documents"],
    menus: [
      {
        title: "Tandatangan",
        path: "/direktur/tandatangan",
        icon: PenTool
      },
      {
        title: "Sudah Ditandatangani",
        path: "/direktur/sudah-ditandatangani",
        icon: FileCheckIcon
      },
      {
        title: "Belum Ditandatangani",
        path: "/direktur/belum-ditandatangani",
        icon: FileText
      }
    ]
  },
  "Manajer Sertifikasi": {
    name: "Manajer Sertifikasi",
    layout: "dashboard-manager",
    defaultRoute: "/manajer/dashboard",
    permissions: ["monitor_assessment"],
    menus: [
      {
        title: "Monitoring Sertifikasi",
        path: "/manajer/monitoring",
        icon: Activity
      },
      {
        title: "Daftar Asesi",
        path: "/manajer/asesi",
        icon: UserCheck
      }
    ]
  },
  "Admin TUK": {
    name: "Admin TUK",
    layout: "dashboard-admin",
    defaultRoute: "/admin-tuk/dashboard",
    permissions: ["verify_personal_documents", "submit_verification_status", "start_pra_assessment", "start_assessment"],
    menus: [
      {
        title: "Dashboard",
        path: "/admin-tuk/dashboard",
        icon: LayoutDashboard
      },
      {
        title: "Verifikasi Asesi",
        path: "/admin-tuk/verification",
        icon: Shield
      },
      {
        title: "Jadwal Asesmen",
        path: "/admin-tuk/schedule",
        icon: Calendar
      }
    ]
  },
  "Asesor": {
    name: "Asesor",
    layout: "dashboard-asesor",
    defaultRoute: "/asesor/dashboard",
    permissions: ["view_assigned_assesi", "submit_assessment_result"],
    menus: [
      {
        title: "Dashboard",
        path: "/asesor/dashboard",
        icon: LayoutDashboard
      },
      {
        title: "Jadwal Asesmen",
        path: "/asesor/schedule",
        icon: Calendar
      },
      {
        title: "Penilaian",
        path: "/asesor/assessment",
        icon: ClipboardCheck
      },
      {
        title: "Daftar Asesi",
        path: "/asesor/asesi",
        icon: Users
      }
    ]
  },
  "Asesi": {
    name: "Asesi",
    layout: "dashboard-asesi",
    defaultRoute: "/asesi/dashboard",
    permissions: ["confirm_personal_data", "join_assessment"],
    menus: [
      {
        title: "Dashboard",
        path: "/asesi/dashboard",
        icon: LayoutDashboard
      },
      {
        title: "Profil Saya",
        path: "/asesi/profile",
        icon: Users
      },
      {
        title: "Sertifikasi",
        path: "/asesi/assessment",
        icon: FileCheckIcon
      },
      {
        title: "Dokumen",
        path: "/asesi/documents",
        icon: Upload
      }
    ]
  },
  "Komtek": {
    name: "Komtek",
    layout: "dashboard-executive",
    defaultRoute: "/komtek/tandatangan",
    permissions: ["sign_document", "view_signed_documents", "view_unsigned_documents"],
    menus: [
      {
        title: "Tandatangan",
        path: "/komtek/tandatangan",
        icon: PenTool
      },
      {
        title: "Sudah Ditandatangani",
        path: "/komtek/sudah-ditandatangani",
        icon: FileCheckIcon
      },
      {
        title: "Belum Ditandatangani",
        path: "/komtek/belum-ditandatangani",
        icon: FileText
      }
    ]
  }
}

// Helper function to get user role configuration
export function getRoleConfig(roleName: string): RoleConfig | null {
  return roleConfig[roleName as UserRole] || null
}

// Helper function to get menus based on role
export function getFilteredMenus(roleName: string, _userPermissions?: Permission[]): MenuItem[] {
  const config = getRoleConfig(roleName)
  if (!config) return []
  return config.menus
}

// Helper function to check if user has permission
export function hasPermission(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission)
}

// Helper function to check if user has any of the required permissions
export function hasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission))
}
