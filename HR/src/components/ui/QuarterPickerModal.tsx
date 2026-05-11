"use client";

import { X, RefreshCw } from "lucide-react";

interface QuarterOption {
  key: string;
  label: string;
  active: boolean;
}

interface QuarterPickerModalProps {
  selectedCount: number;
  quarters: QuarterOption[];
  downloading: boolean;
  onSelect: (quarter: string) => void;
  onClose: () => void;
}

export function QuarterPickerModal({
  selectedCount,
  quarters,
  downloading,
  onSelect,
  onClose,
}: QuarterPickerModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Pilih Quarter</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Download {selectedCount} penilaian asesor. Pilih quarter yang tersedia untuk semua asesor terpilih.
        </p>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {quarters.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Memuat...</p>
          )}
          {quarters.map(q => (
            <button
              key={q.key}
              onClick={() => q.active && onSelect(q.key)}
              disabled={!q.active || downloading}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                q.active
                  ? 'border-slate-200 hover:border-primary hover:bg-primary/5 cursor-pointer'
                  : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className={`font-medium text-sm ${q.active ? 'text-slate-900' : 'text-slate-400'}`}>
                {q.label}
              </span>
              {!q.active && (
                <span className="block text-xs mt-0.5">Tidak semua asesor memiliki penilaian di quarter ini</span>
              )}
            </button>
          ))}
        </div>
        {downloading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Membuat ZIP...
          </div>
        )}
      </div>
    </div>
  );
}
