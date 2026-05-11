"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Mail, Phone, Search, ChevronLeft, ChevronRight, CheckCircle, Download, CheckSquare, Square, Shuffle } from "lucide-react";
import { QuarterPickerModal } from "@/components/ui/QuarterPickerModal";
import { getAvatarColor, getInitials, getStatusBadge, getStatusLabel } from "./utils";

interface Asesor {
  id: number;
  name: string;
  metNumber?: string;
  registrationNo?: string;
  skkNo?: string;
  email?: string;
  phone?: string;
  status: string;
  skkCount?: number;
  skkList?: string[];
  evalThisQuarter?: boolean;
}

interface AsesorClientProps {
  initialAsesors: Asesor[];
  initialTotal: number;
  initialPages: number;
  initialEvaluatedCount?: number;
  initialNotEvaluatedCount?: number;
}

export default function AsesorClient({
  initialAsesors,
  initialTotal,
  initialPages,
  initialEvaluatedCount = 0,
  initialNotEvaluatedCount = 0,
}: AsesorClientProps) {
  const router = useRouter();
  const [asesors, setAsesors] = useState(initialAsesors);
  const [total, setTotal] = useState(initialTotal);
  const [evaluatedCount, setEvaluatedCount] = useState(initialEvaluatedCount);
  const [notEvaluatedCount, setNotEvaluatedCount] = useState(initialNotEvaluatedCount);
  const [pages, setPages] = useState(initialPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evalFilter, setEvalFilter] = useState<"all" | "evaluated" | "not_evaluated">("all");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [showQuarterModal, setShowQuarterModal] = useState(false);
  const [availableQuarters, setAvailableQuarters] = useState<{ key: string; label: string; active: boolean }[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randomMin, setRandomMin] = useState(60);
  const [randomMax, setRandomMax] = useState(90);
  const [randomFilling, setRandomFilling] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const buildParams = useCallback((page: number) => {
    const params = new URLSearchParams({ page: page.toString(), limit: "10", search, sortBy, sortOrder, evalFilter });
    return params;
  }, [search, sortBy, sortOrder, evalFilter]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    const res = await fetch(`/api/asesors/search?${buildParams(page)}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return;
    setAsesors(data.asesors ?? []);
    setTotal(data.total ?? 0);
    setEvaluatedCount(data.evaluatedCount ?? 0);
    setNotEvaluatedCount(data.notEvaluatedCount ?? 0);
    setPages(data.pages ?? 1);
    setCurrentPage(page);
  }, [buildParams]);

  useEffect(() => {
    if (!search.trim() && evalFilter === "all") {
      setAsesors(initialAsesors);
      setTotal(initialTotal);
      setPages(initialPages);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchData(1), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, evalFilter]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/asesors', { method: 'POST' });
      if (res.redirected) router.push(res.url);
    } finally { setSyncing(false); }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.size === asesors.length && asesors.length > 0 ? new Set() : new Set(asesors.map(a => a.id)));
  };

  const handleBulkDownload = async () => {
    setShowQuarterModal(true);
    const res = await fetch('/api/asesors/available-quarters', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asesorIds: Array.from(selectedIds) }),
    });
    if (!res.ok) return;
    setAvailableQuarters((await res.json()).quarters);
  };

  const downloadZip = async (quarter: string) => {
    setDownloading(true);
    try {
      const res = await fetch('/api/asesors/bulk-download', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asesorIds: Array.from(selectedIds), quarter }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `penilaian-asesors-${quarter}.zip`; a.click();
      URL.revokeObjectURL(url);
    } finally { setDownloading(false); setShowQuarterModal(false); setSelectedIds(new Set()); }
  };

  const handleRandomFill = async () => {
    setRandomFilling(true);
    try {
      const res = await fetch('/api/asesors/bulk-random-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ min: randomMin, max: randomMax }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      const { filled } = await res.json();
      if (filled > 0) fetchData(1);
      setShowRandomModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally { setRandomFilling(false); }
  };

  const thClass = "text-left py-3 px-4 font-semibold text-sm text-slate-700 cursor-pointer hover:bg-slate-100 select-none";
  const cbColClass = `py-3 px-3 transition-all duration-300 ease-in-out ${showCheckboxes ? 'w-10 opacity-100' : 'w-0 opacity-0 overflow-hidden px-0'}`;

  return (
    <div className="space-y-4">
      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Total Asesor</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Sudah Dinilai</p>
          <p className="text-xl font-bold text-green-600 mt-1">{evaluatedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Belum Dinilai</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{notEvaluatedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500">Halaman</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{pages}</p>
        </div>
      </div>

      {/* Search + Filter + Actions */}
      <div className="flex items-center gap-3">
        <Button variant={showCheckboxes ? "default" : "outline"} size="sm" className="gap-2 shrink-0"
          onClick={() => { setShowCheckboxes(!showCheckboxes); if (showCheckboxes) setSelectedIds(new Set()); }}>
          {showCheckboxes ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {showCheckboxes ? 'Batal' : 'Pilih'}
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Cari asesor..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm" />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {(["all", "evaluated", "not_evaluated"] as const).map(f => (
            <Button key={f} variant={evalFilter === f ? "default" : "outline"} size="sm"
              onClick={() => { setEvalFilter(f); setSelectedIds(new Set()); setCurrentPage(1); }}>
              {f === 'all' ? 'Semua' : f === 'evaluated' ? 'Sudah Dinilai' : 'Belum Dinilai'}
            </Button>
          ))}
        </div>
        {selectedIds.size > 0 && (
          <Button variant="default" size="sm" className="gap-2 shrink-0" onClick={handleBulkDownload}>
            <Download className="w-4 h-4" /> Download ({selectedIds.size})
          </Button>
        )}
        <form action="/api/asesors" method="POST">
          <Button type="submit" variant="outline" size="sm" className="gap-2 shrink-0" disabled={syncing}>
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sinkronisasi...' : 'Sinkronkan'}
          </Button>
        </form>
        <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => setShowRandomModal(true)}>
          <Shuffle className="w-4 h-4" />
          Random Fill
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className={cbColClass}>
                  <input type="checkbox" checked={asesors.length > 0 && selectedIds.size === asesors.length}
                    onChange={toggleSelectAll} className="rounded border-slate-300" />
                </th>
                <th className={thClass} onClick={() => { setSortBy("name"); setSortOrder(sortBy === "name" && sortOrder === "asc" ? "desc" : "asc"); }}>
                  Asesor {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className={thClass} onClick={() => { setSortBy("metNumber"); setSortOrder(sortBy === "metNumber" && sortOrder === "asc" ? "desc" : "asc"); }}>
                  Nomor MET {sortBy === "metNumber" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className={thClass} onClick={() => { setSortBy("registrationNo"); setSortOrder(sortBy === "registrationNo" && sortOrder === "asc" ? "desc" : "asc"); }}>
                  No. Registrasi {sortBy === "registrationNo" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className={thClass} onClick={() => { setSortBy("skkNo"); setSortOrder(sortBy === "skkNo" && sortOrder === "asc" ? "desc" : "asc"); }}>
                  No. SKK {sortBy === "skkNo" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Kontak</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className={cbColClass}><div className="w-4 h-4 rounded bg-slate-200 animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" /><div className="space-y-2"><div className="h-4 w-36 rounded bg-slate-200 animate-pulse" /><div className="h-3 w-24 rounded bg-slate-200 animate-pulse" /></div></div></td>
                  <td className="py-3 px-4"><div className="h-4 w-20 rounded bg-slate-200 animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-24 rounded bg-slate-200 animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-16 rounded bg-slate-200 animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="space-y-2"><div className="h-3 w-32 rounded bg-slate-200 animate-pulse" /><div className="h-3 w-24 rounded bg-slate-200 animate-pulse" /></div></td>
                  <td className="py-3 px-4"><div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" /></td>
                </tr>
              )) : asesors.map((asesor) => (
                <tr key={asesor.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedIds.has(asesor.id) ? 'bg-primary/5' : ''}`}>
                  <td className={cbColClass}>
                    <input type="checkbox" checked={selectedIds.has(asesor.id)} onChange={() => toggleSelect(asesor.id)} className="rounded border-slate-300" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${getAvatarColor(asesor.name)}`}>
                        {getInitials(asesor.name)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/hr-manager/asesors/${asesor.id}`} className="font-medium text-slate-900 hover:text-primary transition-colors truncate block">
                          {asesor.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">Asesor Kompetensi</span>
                          {asesor.evalThisQuarter && (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Dinilai
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-mono">{asesor.metNumber || '-'}</td>
                  <td className="py-3 px-4 text-sm text-slate-700 font-mono">{asesor.registrationNo || '-'}</td>
                  <td className="py-3 px-4">
                    {asesor.skkCount && asesor.skkCount > 1 ? (
                      <div className="text-sm"><p className="font-medium text-slate-700">{asesor.skkCount} SKK</p><p className="text-xs text-slate-500">Lihat detail →</p></div>
                    ) : <span className="text-sm text-slate-700 font-mono">{asesor.skkNo || '-'}</span>
                  }
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      {asesor.email && <div className="flex items-center gap-2 text-sm text-slate-600"><Mail className="w-3 h-3 shrink-0" /><span className="truncate max-w-[150px]">{asesor.email}</span></div>}
                      {asesor.phone && <div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="w-3 h-3 shrink-0" />{asesor.phone}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4"><Badge className={getStatusBadge(asesor.status)}>{getStatusLabel(asesor.status)}</Badge></td>
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

      {showQuarterModal && mounted && createPortal(
        <QuarterPickerModal selectedCount={selectedIds.size} quarters={availableQuarters} downloading={downloading}
          onSelect={downloadZip} onClose={() => setShowQuarterModal(false)} />, document.body
      )}

      {showRandomModal && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={() => setShowRandomModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Random Fill Penilaian</h2>
            <p className="text-sm text-slate-500 mb-6">Mengisi penilaian kosong di quarter ini dengan nilai acak ({notEvaluatedCount} asesor belum dinilai)</p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nilai Minimum</label>
                <input type="number" min={0} max={100} value={randomMin}
                  onChange={e => setRandomMin(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nilai Maksimum</label>
                <input type="number" min={0} max={100} value={randomMax}
                  onChange={e => setRandomMax(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowRandomModal(false)}>Batal</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={handleRandomFill} disabled={randomFilling || randomMin >= randomMax}>
                {randomFilling ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengisi...
                  </span>
                ) : `Isi ${notEvaluatedCount} Asesor`}
              </Button>
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
