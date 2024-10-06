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

  // Desktop and mobile video URLs for different formats
  const desktopHlsUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/sp_auto/v1728219664/desktop-optimised.m3u8`
  const mobileHlsUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/sp_auto/v1728219497/mobile-optimised.m3u8`
  const desktopMp4Url = `https://res.cloudinary.com/dn20h4mis/video/upload/q_auto,f_auto/v1728219664/desktop-optimised.mp4`
  const mobileMp4Url = `https://res.cloudinary.com/dn20h4mis/video/upload/q_auto,f_auto/v1728219497/mobile-optimised.mp4`
  const desktopWebmUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/q_auto,f_auto/v1728219664/desktop-optimised.webm`
  const mobileWebmUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/q_auto,f_auto/v1728219497/mobile-optimised.webm`

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !inView) return

    const isMobile = window.innerWidth < 768
    const hlsUrl = isMobile ? mobileHlsUrl : desktopHlsUrl
    const mp4Url = isMobile ? mobileMp4Url : desktopMp4Url
    const webmUrl = isMobile ? mobileWebmUrl : desktopWebmUrl

    // HLS support check
    if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari, iOS)
      videoElement.src = hlsUrl
      videoElement.play().catch(() => setVideoError(true))
    } else if (Hls.isSupported()) {
      // Fallback for non-HLS supported browsers (Chrome, Firefox)
      const hls = new Hls()
      hls.loadSource(hlsUrl)
      hls.attachMedia(videoElement)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(() => setVideoError(true))
      })
    } else {
      // Fallback to MP4/WebM if HLS is not supported
      videoElement.src = videoElement.canPlayType('video/webm') ? webmUrl : mp4Url
      videoElement.play().catch(() => setVideoError(true))
    }
  }, [inView, desktopHlsUrl, mobileHlsUrl, desktopMp4Url, mobileMp4Url, desktopWebmUrl, mobileWebmUrl])

  return (
    <div ref={inViewRef} className="relative w-full h-full bg-black">
      {/* Fallback background image for non-HLS compatible devices */}
      {videoError && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227615/background.png')" }}
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
        preload="auto" // Optimize video preload for faster play
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onCanPlayThrough={() => setVideoLoaded(true)} // Set video loaded state when fully buffered
        onError={() => setVideoError(true)} 
        poster="https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227615/background.png" // Poster as fallback for load
      />
    </div>
  )
}
