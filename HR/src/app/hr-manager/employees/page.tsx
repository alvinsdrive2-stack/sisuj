import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";

export default async function EmployeesPage() {
  // Fetch all employees from database
  const employees = await prisma.user.findMany({
    where: { role: { not: 'superadmin' } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      department: true,
      phone: true,
      location: true,
      status: true,
      employeeId: true,
      joinDate: true,
      avatar: true,
    },
    orderBy: { name: 'asc' },
  });

  const stats = [
    { label: "Total Karyawan", value: employees.length },
    { label: "Aktif", value: employees.filter((e) => e.status === 'active').length },
    { label: "Cuti", value: employees.filter((e) => e.status === 'on_leave').length },
    { label: "Departemen", value: new Set(employees.map((e) => e.department).filter(Boolean)).size },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Aktif</Badge>;
      case 'on_leave':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Cuti</Badge>;
      case 'inactive':
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Tidak Aktif</Badge>;
      case 'resigned':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Keluar</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Karyawan</h1>
            <p className="text-slate-600">Kelola data karyawan</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Karyawan
          </Button>
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

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari karyawan..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Karyawan</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Posisi</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Departemen</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Lokasi</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {emp.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{emp.name}</p>
                          {emp.employeeId && <p className="text-xs text-slate-500">{emp.employeeId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {emp.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-700">{emp.position || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{emp.department || '-'}</td>
                    <td className="py-3 px-4 text-sm text-slate-700">{emp.location || '-'}</td>
                    <td className="py-3 px-4">{getStatusBadge(emp.status)}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="text-primary">
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}
