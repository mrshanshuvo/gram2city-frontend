import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Gram2CityLogoProps } from '@/types';

const Gram2CityLogo: React.FC<Gram2CityLogoProps> = ({ width = '', className = '' }) => {
  return (
    <Link href="/" className="inline-flex">
      <div
        className={`flex items-center gap-2.5 ${width} ${className}`}
        aria-label="Gram2City logo"
      >
        <Image
          src="/assets/logo/landscape-logo.png"
          alt="Gram2City logo"
          width={76}
          height={45}
          className="h-9 sm:h-10 w-auto object-contain"
          priority
        />

        {/* Brand Text */}
        <span className="text-2xl font-extrabold tracking-tight select-none">
          <span className="text-primary">Gram</span>
          <span className="text-accent">2</span>
          <span className="text-secondary">City</span>
        </span>
      </div>
    </Link>
  );
};

export default Gram2CityLogo;
