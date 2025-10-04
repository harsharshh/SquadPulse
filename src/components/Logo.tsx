import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'compact';
}

const Logo: React.FC<LogoProps> = ({ variant = 'full' }) => (
  <Link href="/" className="hover:opacity-80 transition-opacity">
    <span className="text-xl font-bold bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#c084fc] bg-clip-text text-transparent">
      {variant === 'full' ? 'SquadPulse' : 'SP'}
    </span>
  </Link>
);

export default Logo;