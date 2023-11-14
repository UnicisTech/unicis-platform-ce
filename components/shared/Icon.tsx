import React from 'react';
import Image from 'next/image';

const Icon = ({ src }: { src: string }) => {
  return (
    <span className="self-center whitespace-nowrap">
      <Image src={src} alt="Unicis.App" layout="fixed" width={24} height={24} />
    </span>
  );
};

export default Icon;
