"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Bell, Shield, Database, Palette, Globe, Save } from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<"general" | "notifications" | "security" | "integrations">("general");

  const sections = [
    { key: "general" as const, label: "Umum", icon: Settings },
    { key: "notifications" as const, label: "Notifikasi", icon: Bell },
    { key: "security" as const, label: "Keamanan", icon: Shield },
    { key: "integrations" as const, label: "Integrasi", icon: Database },
  ];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
          <p className="text-slate-600">Konfigurasi sistem HR</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => setActiveSection(section.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeSection === section.key
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Umum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nama Perusahaan
                    </label>
                    <input
                      type="text"
                      defaultValue="LSP Gatensi"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Zona Waktu Default
                    </label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                      <option>Asia/Jakarta (WIB)</option>
                      <option>Asia/Makassar (WITA)</option>
                      <option>Asia/Jayapura (WIT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bahasa Default
                    </label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                      <option>Bahasa Indonesia</option>
                      <option>English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hari Kerja per Minggu
                    </label>
                    <div className="flex gap-2">
                      {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, i) => (
                        <label key={day} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            defaultChecked={i < 5}
                            className="rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-slate-600">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="gap-2">
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Preferensi Notifikasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { title: "Notifikasi Email", desc: "Terima notifikasi penting via email" },
                    { title: "Notifikasi Absensi", desc: "Alert saat karyawan terlambat/absen" },
                    { title: "Notifikasi Rekrutmen", desc: "Update pelamar baru dan jadwal interview" },
                    { title: "Notifikasi Payroll", desc: "Reminder proses payroll" },
                    { title: "Notifikasi Training", desc: "Reminder training yang akan datang" },
                    { title: "Notifikasi Performa", desc: "Alert review performa pending" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 4} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <Button className="gap-2">
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Keamanan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Password Policy</h3>
                    <div className="space-y-3">
                      {[
                        "Minimum 8 karakter",
                        "Mengandung huruf kapital",
                        "Mengandung angka",
                        "Mengandung simbol",
                      ].map((policy, i) => (
                        <label key={i} className="flex items-center gap-3">
                          <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
                          <span className="text-sm text-slate-600">{policy}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Session Timeout</h3>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none">
                      <option>30 menit</option>
                      <option selected>1 jam</option>
                      <option>2 jam</option>
                      <option>4 jam</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="font-medium text-slate-900 mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">2FA untuk Admin</p>
                        <p className="text-sm text-slate-500">Wajibkan 2FA untuk akses admin</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="gap-2">
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "integrations" && (
              <Card>
                <CardHeader>
                  <CardTitle>Integrasi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Slack", status: "connected", desc: "Notifikasi ke channel Slack" },
                    { name: "Google Workspace", status: "connected", desc: "Sync karyawan & kalender" },
                    { name: "Zoom", status: "disconnected", desc: "Meeting integration" },
                    { name: "BPJS Kesehatan", status: "disconnected", desc: "Sync kepesertaan" },
                    { name: "Bank API", status: "disconnected", desc: "Transfer payroll otomatis" },
                  ].map((integration) => (
                    <div key={integration.name} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900">{integration.name}</h4>
                          <Badge variant={integration.status === "connected" ? "default" : "outline"} className="text-xs">
                            {integration.status === "connected" ? "Terhubung" : "Belum Terhubung"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">{integration.desc}</p>
                      </div>
                      <Button variant={integration.status === "connected" ? "outline" : "default"} size="sm">
                        {integration.status === "connected" ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
}
