import React from 'react';
import Image from 'next/image';

const BearLogo = () => {
  return (
    <Image
    src="/bear_email_sent.png" // the path from the public folder
    alt="Hug Bear Logo"
    width={200}  // Adjust the width and height as per your need
    height={200}
  />
  );
};

export default BearLogo;
