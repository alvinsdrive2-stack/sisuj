"use client";

import { useEffect, useRef, useState } from "react";

interface LoopingVideoBackgroundProps {
  videoSrc: string;
}

export function LoopingVideoBackground({ videoSrc }: LoopingVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoaded(false);

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const handleReady = () => {
      setIsLoaded(true);
      video.play().catch(console.error);
    };

    const handleError = () => {
      console.error("Video load failed, retrying...");
      // Retry: reset src to force reload
      const src = video.src;
      video.src = "";
      video.load();
      setTimeout(() => { video.src = src; video.load(); }, 100);
    };

    video.addEventListener("loadeddata", handleReady);
    video.addEventListener("canplaythrough", handleReady);
    video.addEventListener("error", handleError);
    return () => {
      video.removeEventListener("loadeddata", handleReady);
      video.removeEventListener("canplaythrough", handleReady);
      video.removeEventListener("error", handleError);
    };
  }, [videoSrc]);

  return (
    <>
      <div className="fixed inset-0 w-full h-full object-cover -z-10">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
        )}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.5s ease" }}
        />
        <div className="absolute inset-0 " />
      </div>
    </>
  );
}
