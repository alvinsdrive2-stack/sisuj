import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/toast"
import GoogleDriveUploader from "@/components/GoogleDriveUploader"
import { kegiatanService } from "@/lib/kegiatan-service"
import { CheckCircle2, Upload, Video } from "lucide-react"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"

interface JadwalVideoUploaderProps {
  jadwalId: string
  namaKegiatan: string
  className?: string
  onStatusChange?: (hasVideo: boolean) => void
}

export default function JadwalVideoUploader({ jadwalId, namaKegiatan, className, onStatusChange }: JadwalVideoUploaderProps) {
  const [linkVideo, setLinkVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUploader, setShowUploader] = useState(false)
  const onStatusChangeRef = useRef(onStatusChange)
  onStatusChangeRef.current = onStatusChange

  const fetchLinkVideo = useCallback(async () => {
    if (!jadwalId) return
    setLoading(true)
    try {
      const res = await kegiatanService.getLinkVideo(jadwalId)
      const link = res.data?.link_video || null
      setLinkVideo(link)
      onStatusChangeRef.current?.(!!link)
    } catch (err) {
      console.error("Error fetching link video:", err)
      setLinkVideo(null)
      onStatusChangeRef.current?.(false)
    } finally {
      setLoading(false)
    }
  }, [jadwalId])

  useEffect(() => {
    fetchLinkVideo()
  }, [fetchLinkVideo])

  // Realtime sync: kalau ada upload di halaman lain, status video langsung refresh
  const { publishUpdate } = useRealtimeSync({
    channelName: `jadwal:${jadwalId}`,
    onUpdate: () => { fetchLinkVideo() },
  })

  const handleUploadSuccess = useCallback(async (links: string[]) => {
    try {
      let saved: string | null = null
      for (const link of links) {
        const res = await kegiatanService.updateLinkVideo(jadwalId, link)
        saved = res.data?.link_video ?? link
      }
      setLinkVideo(saved)
      onStatusChangeRef.current?.(!!saved)
      setShowUploader(false)
      toast("Video berhasil diupload ke Google Drive!", "success")
      // Broadcast biar halaman lain yang nampilin status video auto-refetch
      publishUpdate({ type: 'video-upload', jadwalId })
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan link video", "error")
    }
  }, [jadwalId, publishUpdate])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <SimpleSpinner size="sm" />
        Cek video...
      </div>
    )
  }

  return (
    <>
      <div className={`flex items-center gap-3 ${className ?? ''}`}>
        {linkVideo ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              VIDEO SUDAH DI UPLOAD
            </span>
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); setShowUploader(true) }}
              className="h-8 bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Upload Ulang
            </Button>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600">
              <Video className="w-4 h-4" />
              VIDEO BELUM DI UPLOAD!
            </span>
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); setShowUploader(true) }}
              className="h-8 bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Upload Video
            </Button>
          </>
        )}
      </div>

      {showUploader && (
        <GoogleDriveUploader
          googleClientId={import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined}
          folderName={`${jadwalId} - ${namaKegiatan}`}
          parentFolderId={import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID as string | undefined}
          namaAsesi={namaKegiatan || ''}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploader(false)}
        />
      )}
    </>
  )
}
