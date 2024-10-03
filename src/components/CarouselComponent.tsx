"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonials = [
  { quote: "ESU's pieces are breathtaking.", author: "Amira S.", location: "Lahore", rating: 5 },
  { quote: "Fast delivery and exceptional quality.", author: "Ahmed R.", location: "Karachi", rating: 5 },
  { quote: "Found the perfect engagement ring.", author: "Zara T.", location: "Islamabad", rating: 5 },
];

export const CarouselComponent = () => {
  return (
    <Carousel className="w-full overflow-hidden">
      <CarouselContent className="flex justify-center items-center">
        {testimonials.map((testimonial, index) => (
          <CarouselItem key={index} className="flex justify-center w-full max-w-xs sm:max-w-md">
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
  );
};
