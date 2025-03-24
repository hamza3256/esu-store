"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonLinkProps {
  href: string;
  label: string;
  variant: "default" | "link" | "outline" | "destructive" | "secondary" | "ghost" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon";
}

export const ButtonLink = ({ href, label, variant, size }: ButtonLinkProps) => {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), (size === "lg" ? "text-lg" : ""))}>
      {label}
    </Link>
  );
};
