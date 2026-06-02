import { ReactNode, useState, useEffect } from "react"
import DashboardNavbar from "./DashboardNavbar"
import { useAuth } from "@/contexts/auth-context"
import { subscribeNavbarTimer } from "@/lib/navbar-timer"

export default function AsesiMainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [timerNode, setTimerNode] = useState<ReactNode>(null)

  useEffect(() => subscribeNavbarTimer(setTimerNode), [])

  return (
    <>
      <DashboardNavbar userName={user?.name} timerNode={timerNode} />
      {children}
    </>
  )
}
