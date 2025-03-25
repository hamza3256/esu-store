"use client";

import dynamic from 'next/dynamic';

const SocialBanner = dynamic(() => import('@/components/SocialBanner'), { ssr: false });

export default function ClientSocialBanner() {
  return <SocialBanner />;
} 