"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Truck, ShieldCheck, Leaf, ChevronDown, Star, Instagram } from "lucide-react"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import ProductReel from "@/components/ProductReel"
import SocialBanner from "@/components/SocialBanner"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Parallax } from "react-parallax"
import { cn } from "@/lib/utils"

const perks = [
  {
    name: "Nationwide Delivery",
    Icon: Truck,
    description: "Delivering swiftly and securely across Pakistan, ensuring your purchase arrives safely.",
  },
  {
    name: "Certified Quality",
    Icon: ShieldCheck,
    description: "Every piece authenticated for genuine quality.",
  },
  {
    name: "Sustainable Luxury",
    Icon: Leaf,
    description: "Eco-friendly materials and ethical practices.",
  },
]

const testimonials = [
  {
    quote: "ESU's pieces are breathtaking. The attention to detail is unmatched!",
    author: "Amira S.",
    location: "Lahore",
    rating: 5,
  },
  {
    quote: "Fast delivery and exceptional quality. Highly recommend!",
    author: "Ahmed R.",
    location: "Karachi",
    rating: 5,
  },
  {
    quote: "Found the perfect engagement ring. Couldn't be happier!",
    author: "Zara T.",
    location: "Islamabad",
    rating: 5,
  },
]

export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const featuredProductsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const currentVideoRef = videoRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && currentVideoRef) {
            currentVideoRef.play()
          } else if (currentVideoRef) {
            currentVideoRef.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (currentVideoRef) {
      observer.observe(currentVideoRef)
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef)
      }
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollIndicator(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const scrollToNextSection = () => {
    if (featuredProductsRef.current) {
      featuredProductsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <div className="relative h-screen overflow-hidden -mt-16">
        {!videoLoaded && (
          <Image
            src="/background.png"
            alt="Elegant jewelry background"
            fill
            className="absolute top-0 left-0 w-full h-full object-cover -z-20"
            priority
          />
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          className="absolute top-0 left-0 w-full h-full object-cover -z-20"
          preload="auto"
          onCanPlay={() => setVideoLoaded(true)}
          playsInline
          poster="/background.png"
        >
          <source
            src="/desktop.webm"
            type="video/webm"
            media="(min-width: 768px)"
          />
          <source
            src="/mobile.webm"
            type="video/webm"
            media="(max-width: 767px)"
          />
          Your browser does not support the video tag.
        </video>

        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 -z-10"></div>

        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white">
          <MaxWidthWrapper>
            <div className="py-16 mx-auto flex flex-col items-center max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
                Luxury <span className="text-zinc-600">Jewellery</span>{" "} for Every Occasion.
              </h1>
              <p className="mt-4 text-lg max-w-prose text-gray-200">
                Welcome to <span className="font-bold">esü</span>. Discover timeless pieces,
                handcrafted with care, delivered to your doorstep across Pakistan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/products" className={buttonVariants({ variant: "default" })}>
                  Shop Now &rarr;
                </Link>
                <Link href="/about" className={cn(buttonVariants({ variant: "outline" }), "text-black border-white hover:bg-white hover:text-black transition-colors")}>
                  Our Story
                </Link>
              </div>
            </div>
          </MaxWidthWrapper>

          {showScrollIndicator && (
            <div className="absolute bottom-12 justify-items-center  animate-bounce cursor-pointer" onClick={scrollToNextSection}>
              <ChevronDown className="h-8 w-8 ml-12 text-white" />
              <p className="text-sm text-white">Discover Our Treasures</p>
            </div>
          )}
        </div>
      </div>

      <section className="bg-white" ref={featuredProductsRef}>
        <MaxWidthWrapper>
          <ProductReel title="New Arrivals" href="/products" query={{ sort: "desc", limit: 4 }} />
        </MaxWidthWrapper>
      </section>

      <section className="bg-gray-50 py-24">
        <MaxWidthWrapper>
          <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900">The ESÜ Experience</h2>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk) => (
              <Card key={perk.name} className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gold-100 mb-6">
                    <perk.Icon className="w-8 h-8 text-gold-600" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-gray-900">{perk.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg text-gray-600">{perk.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      <MaxWidthWrapper>
        <Parallax bgImage="/order-confirmation.jpg" strength={500}>
          <div className="h-96 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-white mb-4">Crafted with Passion</h2>
              <p className="text-lg text-gray-200">
                Every piece tells a story of artisanal excellence and timeless beauty.
              </p>
            </div>
          </div>
        </Parallax>

        <SocialBanner />
      </MaxWidthWrapper>

      <section className="bg-white py-24">
  <MaxWidthWrapper>
    <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900">Voices of Delight</h2>
    <Carousel className="w-full overflow-hidden">
      <CarouselContent className="flex justify-center items-center">
        {testimonials.map((testimonial, index) => (
          <CarouselItem
            key={index}
            className="flex justify-center w-full max-w-xs sm:max-w-md"
          >
            <Card className="bg-gray-50 border-none shadow-md w-full">
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-gold-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 italic text-center mb-6">
                  &quot;{testimonial.quote}&quot;
                </blockquote>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </MaxWidthWrapper>
</section>



      <section className="bg-gold-50 text-gray-900 py-24">
        <MaxWidthWrapper>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-extrabold mb-6">Adorn Your Story</h2>
            <p className="text-xl mb-10">
              Every piece in our collection is a chapter waiting to be part of your journey.
              Find the perfect jewelry that resonates with your unique style and spirit.
            </p>
          </div>
          <div className="text-center mt-12">
            <Link href="/products" passHref>
              <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-black">
                Explore All Collections &rarr;
              </Button>
            </Link>
          </div>
        </MaxWidthWrapper>
      </section>

      {/* <section className="bg-white py-24">
        <MaxWidthWrapper>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4">Follow Our Journey</h2>
            <p className="text-xl text-gray-600">Get inspired by our latest designs and behind-the-scenes moments.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="relative aspect-square overflow-hidden">
                <Image
                  src={`/instagram-${index + 1}.jpg`}
                  alt={`Instagram post ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <Instagram className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <a href="https://www.instagram.com/esu_jewelry" target="_blank" rel="noopener noreferrer">
                Follow Us on Instagram
              </a>
            </Button>
          </div>
        </MaxWidthWrapper>
      </section> */}
    </>
  )
}