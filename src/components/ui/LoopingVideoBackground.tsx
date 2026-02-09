interface LoopingVideoBackgroundProps {
  videoSrc: string
  blur?: boolean
  scale?: string
}

export function LoopingVideoBackground({
  videoSrc,
  blur = true,
  scale = "100"
}: LoopingVideoBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`w-full h-full object-cover ${blur ? 'blur-sm' : ''}`}
        style={{ transform: `scale(${scale}%)` }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {/* Overlay biar content tetep kebaca */}
      <div className="solid"/>
    </div>
  )
}
