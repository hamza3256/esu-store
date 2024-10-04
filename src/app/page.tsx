import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import ProductReel from "@/components/ProductReel";
import SocialBanner from "@/components/SocialBanner";
import { CarouselComponent } from "@/components/CarouselComponent";
import { VideoBackground } from "@/components/VideoBackground";
import { ButtonLink } from "@/components/ButtonLink";
import { Perks } from "@/components/Perks";
import { Section } from "@/components/Section";
import ParallaxSection from "@/components/ParallaxSection";
import ProductShowcase from "@/components/ProductShowcase";

export default function Home() {
  return (
    <>
      {/* Hero section with background video */}
      <div className="relative h-screen overflow-hidden -mt-16">
        <VideoBackground />

        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-40 -z-10"></div>

        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white">
          <MaxWidthWrapper>
            <div className="py-16 mx-auto flex flex-col items-center max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
                Luxury <span className="text-zinc-600">Jewellery</span> for Every Occasion.
              </h1>
              <p className="mt-4 text-lg max-w-prose text-gray-200">
                Welcome to <span className="font-bold">esü</span>. Discover timeless pieces, handcrafted with care, delivered to your doorstep across Pakistan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {/* <ButtonLink href="/about" label="Our Story" variant="secondary" /> */}
                <ButtonLink href="/products" label="Shop Now" variant="default" />
              </div>
            </div>
          </MaxWidthWrapper>
        </div>
      </div>

      {/* Featured Products */}
      <Section>
        <MaxWidthWrapper>
          <ProductShowcase title="New Arrivals" href="/products" query={{ sort: "desc", limit: 4 }} />
        </MaxWidthWrapper>
      </Section>

      {/* Perks Section */}
      <Section backgroundColor="bg-gray-50">
        <MaxWidthWrapper>
          <Perks />
        </MaxWidthWrapper>
      </Section>

      {/* Parallax Section */}
      <MaxWidthWrapper>
        <ParallaxSection />
        <SocialBanner />
      </MaxWidthWrapper>

      {/* Testimonials */}
      <Section>
        <MaxWidthWrapper>
          <CarouselComponent />
        </MaxWidthWrapper>
      </Section>

      {/* Call to Action */}
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
    </>
  );
}
