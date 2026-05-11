import { prisma } from "@/lib/prisma";
import { Users, ClipboardCheck, DollarSign, AlertCircle } from "lucide-react";

export default async function HRManagerDashboard() {
  // Fetch real data from database
  const [
    totalEmployees,
    activeEmployees,
    onLeaveEmployees,
    todayAttendance,
    todayPresent,
    todayLate,
    todayAbsent,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: 'superadmin' } } }),
    prisma.user.count({ where: { role: { not: 'superadmin' }, status: 'active' } }),
    prisma.user.count({ where: { status: 'on_leave' } }),
    prisma.attendance.count({ where: { date: new Date() } }),
    prisma.attendance.count({ where: { date: new Date(), status: 'present' } }),
    prisma.attendance.count({ where: { date: new Date(), status: 'late' } }),
    prisma.attendance.count({ where: { date: new Date(), status: 'absent' } }),
  ]);

  const stats = [
    { title: "Total Karyawan", value: totalEmployees.toString(), icon: Users, color: "text-blue-600" },
    { title: "Karyawan Aktif", value: activeEmployees.toString(), icon: Users, color: "text-green-600" },
    { title: "Hadir Hari Ini", value: `${todayPresent}/${todayAttendance}`, icon: ClipboardCheck, color: "text-emerald-600" },
    { title: "Cuti", value: onLeaveEmployees.toString(), icon: AlertCircle, color: "text-orange-600" },
  ];

  // Fetch recent activities
  const recentAttendance = await prisma.attendance.findMany({
    where: { date: new Date() },
    include: { user: { select: { id: true, name: true, avatar: true, employeeId: true } } },
    orderBy: { checkInTime: 'desc' },
    take: 5,
  });

  const recentActivities = recentAttendance.map((att) => ({
    id: att.id,
    text: `${att.user.name} check-in ${att.checkInTime ? att.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}`,
    time: 'Hari ini',
    type: 'attendance',
  }));

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Selamat datang kembali, Admin HR!</p>
        </div>

        {/* Stats Grid */}
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Aktivitas Absensi Hari Ini</h2>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{activity.text}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Belum ada data absensi hari ini</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Statistik Hari Ini</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Hadir Tepat Waktu</span>
                <span className="font-semibold text-green-600">{todayPresent} karyawan</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Terlambat</span>
                <span className="font-semibold text-yellow-600">{todayLate} karyawan</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Tidak Hadir</span>
                <span className="font-semibold text-red-600">{todayAbsent} karyawan</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Sedang Cuti</span>
                <span className="font-semibold text-blue-600">{onLeaveEmployees} karyawan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
