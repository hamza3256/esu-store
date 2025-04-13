import React from 'react';
import Image from 'next/image';

const AdminLogo = () => {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/esu-transparent-white.png"
        alt="ESU Store Logo"
        width={150}
        height={50}
        className="object-contain"
      />
    </div>
  );
};

export default AdminLogo; 