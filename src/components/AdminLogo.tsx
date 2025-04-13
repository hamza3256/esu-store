import React from 'react';
import Image from 'next/image';
import { useTheme } from 'payload/components/utilities';

const AdminLogo = () => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-center">
      <Image
        src={theme === 'dark' ? "/esu-transparent-white.png" : "/esu-transparent.png"}
        alt="ESU Store Logo"
        width={150}
        height={50}
        className="object-contain"
      />
    </div>
  );
};

export default AdminLogo; 