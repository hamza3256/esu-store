"use client";

import { Truck, ShieldCheck, Leaf } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

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
];

export const Perks = () => {
  return (
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
  );
};
