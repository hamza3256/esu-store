'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Hls from 'hls.js'

export function VideoBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true, // Only trigger once to avoid re-loading
  })
  const videoRef = useRef<HTMLVideoElement>(null)

  // HLS URLs
  const desktopHlsUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/sp_auto/v1728219664/desktop-optimised.m3u8`
  const mobileHlsUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/sp_auto/v1728219497/mobile-optimised.m3u8`

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !inView) return

    // Choose HLS stream based on screen width
    const isMobile = window.innerWidth < 768
    const hlsUrl = isMobile ? mobileHlsUrl : desktopHlsUrl

    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari, iOS)
      videoElement.src = hlsUrl
      videoElement.play().catch((error) => console.error('Video playback failed:', error))
    } else if (Hls.isSupported()) {
      // Fallback for non-native HLS browsers (Chrome, Firefox)
      const hls = new Hls()
      hls.loadSource(hlsUrl)
      hls.attachMedia(videoElement)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch((error) => console.error('HLS playback failed:', error))
      })
    } else {
      console.error('HLS is not supported in this browser')
    }
  }, [inView, desktopHlsUrl, mobileHlsUrl]) // Dependencies include URL and inView

  return (
    <div ref={inViewRef} className="relative w-full h-full">
      {!videoLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "/background.jpg" }}
          aria-hidden="true"
        />
      )}
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="none" // Defer loading video
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onCanPlayThrough={() => setVideoLoaded(true)} // Set video loaded state on full buffer
        poster="/background.jpg" // Lightweight background image as fallback
      />
    </div>
  )
}
