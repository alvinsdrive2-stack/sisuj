import { ReactNode, useState, useEffect } from "react"
import DashboardNavbar from "./DashboardNavbar"
import DashboardSidebar from "./DashboardSidebar"
import { useAuth } from "@/contexts/auth-context"
import { subscribeNavbarTimer } from "@/lib/navbar-timer"
import { RoleId } from "@/lib/rbac-config"
import { LoopingVideoBackground } from "@/components/ui/LoopingVideoBackground"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import loopVideo from "@/assets/Sequence 01.mp4"

export default function AsesiMainLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const [timerNode, setTimerNode] = useState<ReactNode>(null)

  useEffect(() => subscribeNavbarTimer(setTimerNode), [])

  if (isLoading) {
    return (
      <>
        <LoopingVideoBackground videoSrc={loopVideo} />
        <FullPageLoader text="Memuat..." />
      </>
    )
  }

  const isAsesor = user?.role?.id === RoleId.ASESOR

  if (isAsesor) {
    return (
      <>
        <LoopingVideoBackground videoSrc={loopVideo} />
        <DashboardNavbar userName={user?.name} timerNode={timerNode} />
        <div className="min-h-screen flex">
          <DashboardSidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="bg-white dark:bg-slate-800 dark:text-slate-100 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 min-h-[calc(100vh-120px)]">
              {children}
            </div>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <DashboardNavbar userName={user?.name} timerNode={timerNode} />
      {children}
    </>
  )
}
