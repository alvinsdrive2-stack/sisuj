interface LoopingVideoBackgroundProps {
  videoSrc: string
  scale?: string
}

export function LoopingVideoBackground({
  videoSrc,
  scale = "100"
}: LoopingVideoBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`w-full h-full object-cover`}
        style={{ transform: `scale(${scale}%)`, filter: 'blur(2px)' }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {/* Overlay biar content tetep kebaca */}
      <div className="solid"/>
    </div>
  )
}
