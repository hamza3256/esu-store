import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <Image
    src="/esu-transparent.png" // the path from the public folder
    alt="Hug Bear Logo"
    width={200}  // Adjust the width and height as per your need
    height={200}
  />
  );
};

export default Logo;
