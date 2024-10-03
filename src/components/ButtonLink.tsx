"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface ButtonLinkProps {
  href: string;
  label: string;
  variant: "default" | "link" | "outline" | "destructive" | "secondary" | "ghost" | null | undefined;
}

export const ButtonLink = ({ href, label, variant }: ButtonLinkProps) => {
  return (
    <Link href={href} className={buttonVariants({ variant })}>
      {label} &rarr;
    </Link>
  );
};
