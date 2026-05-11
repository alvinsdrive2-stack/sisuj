"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Building2, MapPin } from "lucide-react";
import { getAvatarColor, getInitials } from "./utils";
import Link from "next/link";

interface AdminTUK {
  id: number;
  name: string;
  registrationNo?: string;
  tukType: number;
  address?: string;
  province?: string;
  adminRegion?: string;
  adminName?: string;
  ketuaTuk?: string;
  status: string;
}

interface AdminTUKClientProps {
  initialData: AdminTUK[];
  initialTotal: number;
  initialPages: number;
}

export default function AdminTUKClient({ initialData, initialTotal, initialPages }: AdminTUKClientProps) {
  const [adminTUKs, setAdminTUKs] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const buildParams = useCallback((page: number) => {
    return new URLSearchParams({ page: page.toString(), limit: "10", search });
  }, [search]);

  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin-tuk/search?${buildParams(page)}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setAdminTUKs(data.adminTUKs ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setCurrentPage(page);
  }, [buildParams]);

  useEffect(() => {
    if (!search.trim()) { setAdminTUKs(initialData); setTotal(initialTotal); setPages(initialPages); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(1), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const mandiriCount = (adminTUKs || []).filter(a => a.tukType === 1).length;
  const sewaktuCount = (adminTUKs || []).filter(a => a.tukType === 2).length;

  return (
    <div className="space-y-4">
      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total TUK</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Mandiri</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{mandiriCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Sewaktu</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{sewaktuCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Halaman</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{pages}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Cari TUK..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Nama TUK</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">No. Registrasi</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-slate-700">Jenis</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Provinsi</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Wilayah</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Admin TUK</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Ketua TUK</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" /><div className="space-y-2"><div className="h-4 w-36 rounded bg-slate-200 animate-pulse" /><div className="h-3 w-24 rounded bg-slate-200 animate-pulse" /></div></div></td>
                  <td className="py-3 px-4"><div className="h-4 w-32 rounded bg-slate-200 animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-28 rounded bg-slate-200 animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-20 rounded bg-slate-200 animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-20 rounded bg-slate-200 animate-pulse" /></td>
                </tr>
              )) : !adminTUKs || adminTUKs.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">Belum ada data TUK</td></tr>
              ) : adminTUKs.map((admin) => (
                <tr key={admin.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <Link href={`/hr-manager/admin-tuk/${admin.id}`} className="flex items-center gap-3 group">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${getAvatarColor(admin.name)}`}>
                        {getInitials(admin.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate group-hover:text-primary transition-colors">{admin.name}</p>
                        {admin.address && <p className="text-xs text-slate-500 truncate max-w-[250px]">{admin.address}</p>}
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-mono">{admin.registrationNo || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={admin.tukType === 1 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                      {admin.tukType === 1 ? 'Mandiri' : 'Sewaktu'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {admin.province || '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">{admin.adminRegion || '-'}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{admin.adminName || '-'}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{admin.ketuaTuk || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Halaman {currentPage} dari {pages}</p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => fetchData(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let p = pages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= pages - 2 ? pages - 4 + i : currentPage - 2 + i;
              return <Button key={p} variant={currentPage === p ? "default" : "outline"} size="sm" onClick={() => fetchData(p)}>{p}</Button>;
            })}
            <Button variant="outline" size="sm" onClick={() => fetchData(currentPage + 1)} disabled={currentPage === pages}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
