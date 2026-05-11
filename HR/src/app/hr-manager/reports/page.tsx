"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Users, TrendingUp, Calendar, BarChart3 } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<"monthly" | "quarterly" | "annual">("monthly");

  const reports = [
    {
      id: 1,
      name: "Laporan Kehadiran Bulanan",
      type: "attendance",
      period: "April 2026",
      format: "PDF, Excel",
      size: "2.4 MB",
      generatedAt: "2026-04-22",
      description: "Ringkasan kehadiran semua karyawan bulan ini",
    },
    {
      id: 2,
      name: "Laporan Rekrutmen Q1 2026",
      type: "recruitment",
      period: "Q1 2026",
      format: "PDF",
      size: "5.1 MB",
      generatedAt: "2026-04-15",
      description: "Statistik rekrutmen dan cost per hire",
    },
    {
      id: 3,
      name: "Laporan Training & Development",
      type: "training",
      period: "Q1 2026",
      format: "PDF, Excel",
      size: "3.8 MB",
      generatedAt: "2026-04-10",
      description: "Training completion dan ROI analysis",
    },
    {
      id: 4,
      name: "Laporan Performa Karyawan",
      type: "performance",
      period: "Q1 2026",
      format: "PDF",
      size: "4.2 MB",
      generatedAt: "2026-04-08",
      description: "Performance review summary dan top performers",
    },
    {
      id: 5,
      name: "Laporan Payroll Bulanan",
      type: "payroll",
      period: "Maret 2026",
      format: "PDF, Excel",
      size: "1.9 MB",
      generatedAt: "2026-04-02",
      description: "Breakdown penggajian dan benefits",
    },
    {
      id: 6,
      name: "Laporan Turnover & Retensi",
      type: "turnover",
      period: "Q1 2026",
      format: "PDF",
      size: "2.1 MB",
      generatedAt: "2026-04-05",
      description: "Turnover rate dan retention analysis",
    },
  ];

  const getReportIcon = (type: string) => {
    switch (type) {
      case "attendance": return "📋";
      case "recruitment": return "💼";
      case "training": return "📚";
      case "performance": return "⭐";
      case "payroll": return "💰";
      case "turnover": return "📊";
      default: return "📄";
    }
  };

  const getReportBadge = (format: string) => {
    const formats = format.split(", ");
    return (
      <div className="flex gap-1">
        {formats.map((f) => (
          <Badge key={f} variant="outline" className="text-xs">
            {f.trim()}
          </Badge>
        ))}
      </div>
    );
  };

  const quickStats = [
    { label: "Total Laporan", value: "24", icon: FileText, color: "text-blue-600" },
    { label: "Bulan Ini", value: "8", icon: Calendar, color: "text-green-600" },
    { label: "Unduhan", value: "156", icon: Download, color: "text-purple-600" },
    { label: "Terjadwal", value: "3", icon: TrendingUp, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Laporan</h1>
            <p className="text-slate-600">Generate dan download laporan HR</p>
          </div>
          <Button className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Buat Laporan Baru
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickStats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Laporan Karyawan</h3>
                  <p className="text-sm text-slate-600">Data lengkap karyawan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Laporan Absensi</h3>
                  <p className="text-sm text-slate-600">Rekap kehadiran</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Laporan Performa</h3>
                  <p className="text-sm text-slate-600">Review kinerja</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Type Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          {[
            { key: "monthly" as const, label: "Bulanan" },
            { key: "quarterly" as const, label: "Kuartalan" },
            { key: "annual" as const, label: "Tahunan" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                reportType === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Laporan Tersedia</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                      {getReportIcon(report.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{report.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{report.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span>Periode: {report.period}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                        <span>•</span>
                        <span>{new Date(report.generatedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        {getReportBadge(report.format)}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="w-3 h-3" />
                            Unduh
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Laporan Terjadwal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Laporan Payroll Bulanan", schedule: "Setiap tanggal 1", nextRun: "2026-05-01" },
                { name: "Laporan Kehadiran Mingguan", schedule: "Setiap hari Senin", nextRun: "2026-04-28" },
                { name: "Laporan Training Kuartalan", schedule: "Awal kuartal", nextRun: "2026-07-01" },
              ].map((scheduled, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{scheduled.name}</p>
                    <p className="text-xs text-slate-500">{scheduled.schedule}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Next: {new Date(scheduled.nextRun).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}
