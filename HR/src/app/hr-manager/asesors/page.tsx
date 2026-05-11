"use client";

import { useState, useEffect } from "react";
import { UserStar, Building2 } from "lucide-react";
import { Suspense } from "react";
import AsesorClient from "./AsesorClient";
import AdminTUKClient from "./AdminTUKClient";

type ViewMode = "asesor" | "adminTuk";

interface AsesorData {
  asesors: any[];
  total: number;
  pages: number;
  evaluatedCount: number;
  notEvaluatedCount: number;
}

interface AdminTUKData {
  adminTUKs: any[];
  total: number;
  pages: number;
}

const tabs: { key: ViewMode; label: string; icon: typeof UserStar }[] = [
  { key: "asesor", label: "Asesor", icon: UserStar },
  { key: "adminTuk", label: "Admin TUK", icon: Building2 },
];

export default function PenilaianPage() {
  const [view, setView] = useState<ViewMode>("asesor");

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Penilaian</h1>
      <p className="text-slate-600 mb-6">Kelola data penilaian asesor dan admin TUK</p>

      <div className="border-b border-slate-200 mb-6">
        <div className="flex items-center gap-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                  view === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "asesor" ? (
        <Suspense fallback={<AsesorSkeleton />}>
          <AsesorClientWrapper />
        </Suspense>
      ) : (
        <Suspense fallback={<AdminTUKSkeleton />}>
          <AdminTUKClientWrapper />
        </Suspense>
      )}
    </div>
  );
}

function AsesorClientWrapper() {
  const [data, setData] = useState<AsesorData | null>(null);

  useEffect(() => {
    fetch('/api/asesors').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <AsesorSkeleton />;

  return (
    <AsesorClient
      initialAsesors={data.asesors}
      initialTotal={data.total}
      initialPages={data.pages}
      initialEvaluatedCount={data.evaluatedCount}
      initialNotEvaluatedCount={data.notEvaluatedCount}
    />
  );
}

function AdminTUKClientWrapper() {
  const [data, setData] = useState<AdminTUKData | null>(null);

  useEffect(() => {
    fetch('/api/admin-tuk').then(r => r.json()).then(setData);
  }, []);

  if (!data) return <AdminTUKSkeleton />;

  return (
    <AdminTUKClient
      initialData={data.adminTUKs}
      initialTotal={data.total}
      initialPages={data.pages}
    />
  );
}

function SkeletonCard() {
  return <div className="bg-white rounded-xl border border-slate-200 p-4"><div className="h-3 w-20 rounded bg-slate-200 animate-pulse" /><div className="h-6 w-12 rounded bg-slate-200 animate-pulse mt-2" /></div>;
}

function AsesorSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      <div className="flex items-center gap-3">
        <div className="h-9 w-20 rounded-lg bg-slate-200 animate-pulse" />
        <div className="flex-1 h-9 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-9 w-28 rounded-lg bg-slate-200 animate-pulse" />
        <div className="h-9 w-24 rounded-lg bg-slate-200 animate-pulse" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /></tr></thead>
          <tbody>{Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" /><div className="space-y-2"><div className="h-4 w-36 rounded bg-slate-200 animate-pulse" /><div className="h-3 w-24 rounded bg-slate-200 animate-pulse" /></div></div></td>
              <td className="py-3 px-4"><div className="h-4 w-20 rounded bg-slate-200 animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-24 rounded bg-slate-200 animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-16 rounded bg-slate-200 animate-pulse" /></td>
              <td className="py-3 px-4"><div className="space-y-2"><div className="h-3 w-32 rounded bg-slate-200 animate-pulse" /><div className="h-3 w-24 rounded bg-slate-200 animate-pulse" /></div></td>
              <td className="py-3 px-4"><div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-16 rounded-full bg-slate-200 animate-pulse" /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdminTUKSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-9 rounded-lg bg-slate-200 animate-pulse" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50"><tr><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /><th className="py-3 px-4 h-10" /></tr></thead>
          <tbody>{Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100">
              <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" /><div className="space-y-2"><div className="h-4 w-36 rounded bg-slate-200 animate-pulse" /><div className="h-3 w-24 rounded bg-slate-200 animate-pulse" /></div></div></td>
              <td className="py-3 px-4"><div className="h-4 w-28 rounded bg-slate-200 animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse mx-auto" /></td>
              <td className="py-3 px-4"><div className="h-4 w-24 rounded bg-slate-200 animate-pulse" /></td>
              <td className="py-3 px-4"><div className="h-4 w-20 rounded bg-slate-200 animate-pulse" /></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
