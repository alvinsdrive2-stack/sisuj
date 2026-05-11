"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, DollarSign, Wallet, TrendingUp, AlertCircle } from "lucide-react";

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState("2026-04");
  const [searchQuery, setSearchQuery] = useState("");

  const payroll = [
    {
      id: 1,
      name: "Ahmad Rizky",
      position: "Software Engineer",
      department: "IT",
      basicSalary: 12000000,
      allowances: 2500000,
      deductions: 800000,
      netSalary: 13700000,
      status: "paid",
      paidDate: "2026-04-01",
    },
    {
      id: 2,
      name: "Sarah Putri",
      position: "HR Specialist",
      department: "Human Resources",
      basicSalary: 8000000,
      allowances: 1500000,
      deductions: 500000,
      netSalary: 9000000,
      status: "paid",
      paidDate: "2026-04-01",
    },
    {
      id: 3,
      name: "Budi Santoso",
      position: "Marketing Manager",
      department: "Marketing",
      basicSalary: 15000000,
      allowances: 3500000,
      deductions: 1200000,
      netSalary: 17300000,
      status: "pending",
      paidDate: null,
    },
    {
      id: 4,
      name: "Dewi Lestari",
      position: "Finance Staff",
      department: "Finance",
      basicSalary: 7000000,
      allowances: 1000000,
      deductions: 400000,
      netSalary: 7600000,
      status: "paid",
      paidDate: "2026-04-01",
    },
    {
      id: 5,
      name: "Eko Prasetyo",
      position: "Operations Lead",
      department: "Operations",
      basicSalary: 11000000,
      allowances: 2000000,
      deductions: 700000,
      netSalary: 12300000,
      status: "pending",
      paidDate: null,
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Dibayar</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Gagal</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalPayroll = payroll.reduce((acc, emp) => acc + emp.netSalary, 0);
  const paidCount = payroll.filter(p => p.status === "paid").length;
  const pendingCount = payroll.filter(p => p.status === "pending").length;

  const stats = [
    { label: "Total Payroll", value: formatCurrency(totalPayroll), icon: Wallet, color: "text-blue-600" },
    { label: "Sudah Dibayar", value: `${paidCount}/${payroll.length}`, icon: DollarSign, color: "text-green-600" },
    { label: "Pending", value: `${pendingCount} karyawan`, icon: AlertCircle, color: "text-yellow-600" },
    { label: "Rata-rata Gaji", value: formatCurrency(totalPayroll / payroll.length), icon: TrendingUp, color: "text-purple-600" },
  ];

  const filteredPayroll = payroll.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
            <p className="text-slate-600">Kelola penggajian karyawan</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2">
              Proses Payroll
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
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

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari karyawan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Payroll Table */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Karyawan</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Gaji Pokok</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Tunjangan</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Potongan</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Gaji Bersih</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.map((emp) => (
                    <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.position}</p>
                        <p className="text-xs text-slate-500">{emp.department}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{formatCurrency(emp.basicSalary)}</td>
                      <td className="py-3 px-4 text-green-600">+{formatCurrency(emp.allowances)}</td>
                      <td className="py-3 px-4 text-red-600">-{formatCurrency(emp.deductions)}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{formatCurrency(emp.netSalary)}</td>
                      <td className="py-3 px-4">{getStatusBadge(emp.status)}</td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm" className="text-primary">Detail</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Ringkasan Payroll</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Gaji Pokok</span>
                  <span className="font-medium">{formatCurrency(payroll.reduce((a, b) => a + b.basicSalary, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Tunjangan</span>
                  <span className="font-medium text-green-600">{formatCurrency(payroll.reduce((a, b) => a + b.allowances, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Potongan</span>
                  <span className="font-medium text-red-600">{formatCurrency(payroll.reduce((a, b) => a + b.deductions, 0))}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-medium text-slate-900">Total Dibayarkan</span>
                  <span className="font-bold text-slate-900">{formatCurrency(totalPayroll)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Distribusi Gaji per Departemen</h3>
              <div className="space-y-3">
                {[
                  { dept: "IT", total: 45000000, percentage: 35 },
                  { dept: "Marketing", total: 32000000, percentage: 25 },
                  { dept: "Operations", total: 28000000, percentage: 22 },
                  { dept: "Finance", total: 15000000, percentage: 12 },
                  { dept: "HR", total: 8000000, percentage: 6 },
                ].map((item) => (
                  <div key={item.dept} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{item.dept}</span>
                      <span className="font-medium">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
