import { prisma } from "@/lib/prisma";
import { Users, ClipboardCheck, DollarSign } from "lucide-react";

export default async function HRStaffDashboard() {
  // Fetch stats for HR Staff
  const [totalEmployees, activeEmployees, onLeaveEmployees, todayPresent] = await Promise.all([
    prisma.user.count({ where: { role: { not: 'superadmin' } } }),
    prisma.user.count({ where: { role: { not: 'superadmin' }, status: 'active' } }),
    prisma.user.count({ where: { status: 'on_leave' } }),
    prisma.attendance.count({ where: { date: new Date(), status: 'present' } }),
  ]);

  const stats = [
    { title: "Total Karyawan", value: totalEmployees, icon: Users, color: "text-blue-600" },
    { title: "Karyawan Aktif", value: activeEmployees, icon: Users, color: "text-green-600" },
    { title: "Hadir Hari Ini", value: todayPresent, icon: ClipboardCheck, color: "text-emerald-600" },
    { title: "Sedang Cuti", value: onLeaveEmployees, icon: DollarSign, color: "text-orange-600" },
  ];

  // Recent attendance
  const recentAttendance = await prisma.attendance.findMany({
    where: { date: new Date() },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { checkInTime: 'desc' },
    take: 5,
  });

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Selamat datang kembali, HR Staff!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Aktivitas Absensi Hari Ini</h2>
          <div className="space-y-3">
            {recentAttendance.length > 0 ? (
              recentAttendance.map((att) => (
                <div key={att.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <p className="text-sm text-slate-800">{att.user.name}</p>
                  <p className="text-xs text-slate-500">
                    {att.checkInTime ? att.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data absensi hari ini</p>
            )}
          </div>
        </div>
      </div>
  );
}
