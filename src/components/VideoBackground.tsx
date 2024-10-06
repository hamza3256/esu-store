'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Hls from 'hls.js'

export function VideoBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true, 
  })
  const videoRef = useRef<HTMLVideoElement>(null)

  const desktopHlsUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/sp_auto/v1728219664/desktop-optimised.m3u8`
  const mobileHlsUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/sp_auto/v1728219497/mobile-optimised.m3u8`

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !inView) return

    const isMobile = window.innerWidth < 768
    const hlsUrl = isMobile ? mobileHlsUrl : desktopHlsUrl

    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = hlsUrl
      videoElement.play().catch(() => setVideoError(true))
    } else if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(hlsUrl)
      hls.attachMedia(videoElement)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(() => setVideoError(true))
      })
    } else {
      setVideoError(true) 
    }
  }, [inView, desktopHlsUrl, mobileHlsUrl])

  return (
    <div ref={inViewRef} className="relative w-full h-full bg-black">
      {(videoError || !videoLoaded) && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227615/background.png')" }}
          aria-hidden="true"
        />
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="none" 
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onCanPlayThrough={() => setVideoLoaded(true)} 
        onError={() => setVideoError(true)} 
        poster="https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227615/background.png" 
      />
    </div>
  )
}
