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

  const desktopHlsUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/sp_auto/v1728242042/desktop-optimised.m3u8`
  const mobileHlsUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/sp_auto/v1728242171/mobile-optimised.m3u8`
  const desktopOptimisedUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/f_webm,vc_vp9,q_auto/v1728242042/desktop-optimised.mp4`
  const mobileOptimisedUrl = `https://res.cloudinary.com/dn20h4mis/video/upload/f_webm,vc_vp9,q_auto/v1728242171/mobile-optimised.mp4`

  const desktopFallbackImageUrl = "https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_webp,fl_awebp/v1728227615/background.png"
  const mobileFallbackImageUrl = "https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_webp/v1728227919/order-confirmation.jpg"

  const [fallbackImageUrl, setFallbackImageUrl] = useState(desktopFallbackImageUrl)

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement || !inView) return

    const isMobile = window.innerWidth < 768
    const hlsUrl = isMobile ? mobileHlsUrl : desktopHlsUrl
    const optimisedUrl = isMobile ? mobileOptimisedUrl : desktopOptimisedUrl

    // Set fallback image based on the device type
    setFallbackImageUrl(isMobile ? mobileFallbackImageUrl : desktopFallbackImageUrl)

    let hls: Hls | null = null

    const loadVideo = async () => {
      try {
        if (Hls.isSupported()) {
          hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            enableWorker: true,
            lowLatencyMode: true,
          })
          hls.loadSource(hlsUrl)
          hls.attachMedia(videoElement)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoElement.play().catch(console.error)
          })
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error('HLS error:', data)
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls?.destroy()
                fallbackToMP4()
              }
            }
          })
        } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
          videoElement.src = hlsUrl
          videoElement.addEventListener('loadedmetadata', () => {
            videoElement.play().catch(console.error)
          })
        } else {
          fallbackToMP4()
        }
      } catch (error) {
        console.error('Video playback error:', error)
        setVideoError(true)
      }
    }

    const fallbackToMP4 = () => {
      videoElement.src = optimisedUrl
      videoElement.play().catch(() => {
        console.error('MP4 fallback failed')
        setVideoError(true)
      })
    }

    videoElement.muted = true
    videoElement.playsInline = true
    loadVideo()

    videoElement.addEventListener('canplay', () => setVideoLoaded(true))

    return () => {
      if (hls) {
        hls.destroy()
      }
      if (videoElement) {
        videoElement.pause()
        videoElement.src = ''
        videoElement.load()
      }
    }
  }, [inView])

  return (
    <div ref={inViewRef} className="relative w-full h-full bg-black">
      {videoError && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${fallbackImageUrl}')` }}
          aria-hidden="true"
        />
      )}

      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={() => setVideoError(true)}
        poster={fallbackImageUrl}
        aria-hidden="true"
      >
        <source src={desktopOptimisedUrl} type="video/webm" />
        <source src={desktopOptimisedUrl.replace('f_webm,vc_vp9', 'f_mp4')} type="video/mp4" />
      </video>
    </div>
  )
}
