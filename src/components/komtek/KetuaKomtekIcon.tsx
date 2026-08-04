import ketuaIcon from "@/assets/ketuaiconkomtek.png"

interface KetuaKomtekIconProps {
  signed?: boolean
  className?: string
}

export function KetuaKomtekIcon({ signed = false, className = "" }: KetuaKomtekIconProps) {
  const color = signed ? "#10b981" : "#ef4444"
  return (
    <span
      title={signed ? "Ketua Komtek — sudah tanda tangan" : "Ketua Komtek — belum tanda tangan"}
      aria-label={signed ? "Ketua Komtek (sudah TTD)" : "Ketua Komtek (belum TTD)"}
      className={`inline-block w-6 h-6 ${className}`}
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
  )
}
