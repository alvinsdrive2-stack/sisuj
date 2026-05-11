import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Asesor</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Nomor MET</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">No. Registrasi</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">No. SKK</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Kontak</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-36 font-mono" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-32 font-mono" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-40 font-mono" /></td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                  <td className="py-3 px-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
