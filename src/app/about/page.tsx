"use client"

import Image from "next/image"
import { Clock, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="grid gap-12 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Crafting Timeless Elegance</h1>
          <p className="text-lg text-muted-foreground mb-6">
            At <span className="font-semibold">ESÜ Store</span>, we believe that every piece of jewelry tells a story. Our passion lies in creating exquisite pieces that capture the essence of beauty and become cherished heirlooms.
          </p>
          <Button size="lg">Explore Our Collection</Button>
        </div>
        <div className="relative h-[400px] rounded-lg overflow-hidden">
          <Image
            src="/background.png?height=400&width=600"
            alt="Jewelry craftsmanship"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3 my-16">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-2">Artisanal Craftsmanship</h3>
            <p className="text-muted-foreground">Each piece is meticulously handcrafted by our skilled artisans, ensuring unparalleled quality and attention to detail.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-2">Ethical Sourcing</h3>
            <p className="text-muted-foreground">We are committed to using responsibly sourced gemstones and precious metals, prioritizing both beauty and ethical practices.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-2">Personalised Service</h3>
            <p className="text-muted-foreground">Our expert consultants are dedicated to helping you find the perfect piece that resonates with your unique style and story.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-12 md:grid-cols-2 items-center my-16">
        <div className="order-2 md:order-1">
          <div className="relative h-[400px] rounded-lg overflow-hidden bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
            <div className="text-white text-center">
              <Clock className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
              <p className="text-lg">We're putting the finishing touches on our store</p>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">Opening Soon Near You</h2>
          <p className="text-lg text-muted-foreground mb-6">
            We're excited to announce that ESÜ Gems Gallery will be opening its doors in your area soon. Our new boutique will offer a serene environment where you can explore our collections and receive personalized consultations.
          </p>
          <div className="flex items-center text-muted-foreground mb-4">
            <Clock className="mr-2" />
            <span>Grand Opening: Coming Fall 2024</span>
          </div>
          <div className="flex items-center text-muted-foreground mb-6">
            <Mail className="mr-2" />
            <span>Sign up for updates on our grand opening</span>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Enter your email" className="max-w-xs" />
            <Button>Notify Me</Button>
          </div>
        </div>
      </div>

      <div className="text-center mt-16">
        <h2 className="text-3xl font-bold tracking-tighter mb-4">Join the ESÜ Family</h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          We're building a team of passionate individuals to bring our vision to life. If you're a skilled craftsman, designer, or jewelry enthusiast, we'd love to hear from you.
        </p>
        <Button variant="secondary" size="lg">View Career Opportunities</Button>
      </div>
    </div>
  )
}