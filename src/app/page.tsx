import { Suspense } from 'react'
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import SocialBanner from "@/components/SocialBanner"
import { CarouselComponent } from "@/components/CarouselComponent"
import { VideoBackground } from "@/components/VideoBackground"
import { ButtonLink } from "@/components/ButtonLink"
import { Perks } from "@/components/Perks"
import { Section } from "@/components/Section"
import ParallaxSection from "@/components/ParallaxSection"
import ProductShowcase from "@/components/ProductShowcase"

export const metadata = {
  title: 'esü - Luxury Jewellery for Every Occasion',
  description: 'Discover timeless pieces, handcrafted with care, delivered to your doorstep across Pakistan.',
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <PerksSection />
      <Suspense fallback={<ParallaxSectionSkeleton />}>
        <ParallaxSection />
      </Suspense>
      <Suspense fallback={<SocialBannerSkeleton />}>
        <SocialBanner />
      </Suspense>
      <TestimonialsSection />
      <CallToActionSection />
    </>
  )
}

function HeroSection() {
  return (
    <section className="relative h-screen overflow-hidden -mt-16" aria-labelledby="hero-heading">
      <div className="absolute inset-0 z-0">
        <VideoBackground />
      </div>
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" aria-hidden="true"></div>
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white">
        <MaxWidthWrapper>
          <div className="py-16 mx-auto flex flex-col items-center max-w-3xl">
            <h1 id="hero-heading" className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Luxury <em className="text-gold-600 font-serif not-italic">Jewellery</em> for Every Occasion
            </h1>
            <p className="mt-4 text-lg max-w-prose text-gray-200">
              Welcome to <span className="font-bold font-outfit">esü</span>. Discover timeless pieces, handcrafted with care, delivered to your doorstep across Pakistan.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <ButtonLink href="/products" label="Shop Now" variant="default" />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  return (
    <Section>
      <MaxWidthWrapper>
        <ProductShowcase title="New Arrivals" href="/products" query={{ sort: "desc", limit: 4 }} />
      </MaxWidthWrapper>
    </Section>
  )
}

function PerksSection() {
  return (
    <Section backgroundColor="bg-gray-50">
      <MaxWidthWrapper>
        <Perks />
      </MaxWidthWrapper>
    </Section>
  )
}

function ParallaxSectionSkeleton() {
  return <div className="h-96 bg-gray-200 animate-pulse"></div>
}

function SocialBannerSkeleton() {
  return <div className="h-20 bg-gray-200 animate-pulse"></div>
}

function TestimonialsSection() {
  return (
    <Section>
      <MaxWidthWrapper>
        <CarouselComponent />
      </MaxWidthWrapper>
    </Section>
  )
}

function CallToActionSection() {
  return (
    <Section backgroundColor="bg-gold-50">
      <MaxWidthWrapper>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold mb-6">Adorn Your Story</h2>
          <p className="text-xl mb-10">
            Every piece in our collection is a chapter waiting to be part of your journey. Find the perfect jewellery that resonates with your unique style and spirit.
          </p>
          <ButtonLink href="/products" label="Explore All Collections" variant="default" />
        </div>
      </MaxWidthWrapper>
    </Section>
  )
}