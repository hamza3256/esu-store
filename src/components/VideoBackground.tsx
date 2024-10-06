'use client'

import { useState, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

export function VideoBackground() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })
  const videoRef = useRef<HTMLVideoElement>(null)

  const videoUrlDesktop = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:best,f_auto,vc_h265,w_1920/desktop.mp4`
  const videoUrlMobile = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:low,f_auto,vc_h265,w_768/mobile.mp4`

  useEffect(() => {
    if (inView && videoRef.current) {
      videoRef.current.play().catch((error) => console.error('Video playback failed:', error))
    } else if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [inView])

  return (
    <div ref={inViewRef} className="relative w-full h-full">
      {!videoLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/background.png')" }}
          aria-hidden="true"
        />
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          videoLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onCanPlay={() => setVideoLoaded(true)}
        poster="/background.png"
      >
        <source
          src={videoUrlDesktop}
          type="video/mp4"
          media="(min-width: 768px)"
        />
        <source
          src={videoUrlMobile}
          type="video/mp4"
          media="(max-width: 767px)"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}