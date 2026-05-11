import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const selectedDate = searchParams.date
    ? new Date(searchParams.date)
    : new Date();

  // Fetch attendance data for selected date
  const attendanceData = await prisma.attendance.findMany({
    where: { date: selectedDate },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          department: true,
          employeeId: true,
          avatar: true,
        },
      },
    },
    orderBy: { checkInTime: 'asc' },
  });

  // Get all employees for present/absent tracking
  const allEmployees = await prisma.user.findMany({
    where: { role: { not: 'superadmin' } },
    select: { id: true, name: true, employeeId: true },
  });

  const stats = [
    { label: "Total Karyawan", value: allEmployees.length },
    { label: "Hadir", value: attendanceData.filter((a) => a.status === 'present').length },
    { label: "Terlambat", value: attendanceData.filter((a) => a.status === 'late').length },
    { label: "Belum Check-in", value: allEmployees.length - attendanceData.length },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1"><CheckCircle className="w-3 h-3" /> Hadir</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1"><AlertCircle className="w-3 h-3" /> Terlambat</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1"><XCircle className="w-3 h-3" /> Absen</Badge>;
      case 'leave':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Cuti</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Absensi</h1>
            <p className="text-slate-600">Monitor kehadiran karyawan</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              defaultValue={selectedDate.toISOString().split('T')[0]}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <Button variant="outline">Export</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
              <p className="text-sm text-slate-600">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Karyawan</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Check In</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Check Out</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Lokasi</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => (
                  <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{record.user.name}</p>
                        <p className="text-xs text-slate-500">{record.user.position}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {record.checkInTime ? (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {record.checkInTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {record.checkOutTime ? (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock className="w-4 h-4" />
                          {record.checkOutTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {record.checkInLocation ? (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {record.checkInLocation}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* No Data */}
        {attendanceData.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">Belum ada data absensi untuk tanggal ini</p>
          </div>
        )}
      </div>
  );
}
