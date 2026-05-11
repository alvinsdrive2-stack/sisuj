import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, CheckCircle, UserCircle } from "lucide-react";

export default async function EmployeeDashboard() {
  // For demo, use first employee
  const employee = await prisma.user.findFirst({
    where: { role: 'Employee' },
    select: {
      id: true,
      name: true,
      email: true,
      position: true,
      department: true,
      employeeId: true,
      joinDate: true,
      location: true,
      avatar: true,
      status: true,
    },
  });

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Employee not found</p>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get today's attendance
  const todayAttendance = await prisma.attendance.findFirst({
    where: {
      userId: employee.id,
      date: today,
    },
  });

  const stats = [
    { label: "Kehadiran Bulan Ini", value: "18/20", icon: CheckCircle, color: "text-green-600" },
    { label: "Cuti Tersisa", value: "9 hari", icon: Calendar, color: "text-blue-600" },
    { label: "Training Selesai", value: "2", color: "text-purple-600" },
  ];

  // Get recent attendance history
  const attendanceHistory = await prisma.attendance.findMany({
    where: { userId: employee.id },
    orderBy: { date: 'desc' },
    take: 5,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Hadir</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Terlambat</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Absen</Badge>;
      case 'leave':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Cuti</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout userName={employee.name} userRole="Employee">
      <div className="space-y-6">
        {/* Welcome & Check-in */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Selamat Datang, {employee.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-600">
              {today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {!todayAttendance?.checkOutTime ? (
            <div className="flex items-center gap-2">
              {todayAttendance?.checkInTime ? (
                <div className="text-right mr-4">
                  <p className="text-sm text-slate-600">Check-in: {todayAttendance.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p className="text-lg font-semibold text-green-600">Sudah Check-in</p>
                </div>
              ) : (
                <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Check In
                </button>
              )}
            </div>
          ) : (
            <div className="text-right">
              <p className="text-sm text-slate-600">Check-out: {todayAttendance?.checkOutTime?.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-lg font-semibold text-slate-900">Selesai Bekerja</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10`}>
                    {typeof stat.icon === "string" ? (
                      <span className="text-xl">{stat.icon}</span>
                    ) : (
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Ajukan Cuti", icon: "🏖️", path: "/employee/leave" },
                    { label: "Lihat Slip Gaji", icon: "💰", path: "/employee/payslip" },
                    { label: "Training", icon: "📚", path: "/employee/training" },
                    { label: "Profil Saya", icon: "👤", path: "/employee/profile" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-primary transition-all text-center"
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <p className="text-sm font-medium text-slate-700 mt-2">{action.label}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attendance History */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Riwayat Kehadiran</h2>
                <div className="space-y-3">
                  {attendanceHistory.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">
                          {record.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                          <span>In: {record.checkInTime ? record.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                          <span>Out: {record.checkOutTime ? record.checkOutTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                        </div>
                      </div>
                      {getStatusBadge(record.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-primary">
                      {employee.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                  <p className="text-sm text-slate-600">{employee.position}</p>
                  {employee.employeeId && <p className="text-xs text-slate-500 mt-1">{employee.employeeId}</p>}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Departemen</span>
                    <span className="font-medium text-slate-900">{employee.department || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lokasi</span>
                    <span className="font-medium text-slate-900">{employee.location || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bergabung</span>
                    <span className="font-medium text-slate-900">
                      {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
