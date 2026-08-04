import ketuaIcon from "@/assets/ketuaiconkomtek.png"

interface KetuaKomtekIconProps {
  signed?: boolean
  className?: string
}

export function KetuaKomtekIcon({ signed = false, className = "" }: KetuaKomtekIconProps) {
  const color = signed ? "#10b981" : "#ef4444"
  return (
    <div
      title={signed ? "Ketua Komtek — sudah tanda tangan" : "Ketua Komtek — belum tanda tangan"}
      aria-label={signed ? "Ketua Komtek (sudah TTD)" : "Ketua Komtek (belum TTD)"}
      className={`flex flex-col items-center gap-0.5 ${className}`}
    >
      <span
        className="inline-block w-12 h-12"
        style={{
          backgroundColor: color,
          WebkitMaskImage: `url(${ketuaIcon})`,
          maskImage: `url(${ketuaIcon})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
      <span
        className="text-[10px] font-bold tracking-wider uppercase leading-none"
        style={{ color }}
      >
        Ketua
      </span>
    </div>
  )
}
