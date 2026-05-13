import { ReactNode } from "react"
import DashboardNavbar from "./DashboardNavbar"
import { useAuth } from "@/contexts/auth-context"

export default function AsesiMainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  return (
    <>
      <DashboardNavbar userName={user?.name} />
      {children}
    </>
  )
}
