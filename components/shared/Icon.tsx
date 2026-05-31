import React from 'react';
import Image from 'next/image';

const Icon = ({ src }: { src: string }) => {
  return (
    <span className="self-center whitespace-nowrap">
      <Image
        src={src}
        alt="Unicis.App"
        width={24}
        height={24}
        style={{ width: '24px', height: 'auto' }}
      />
    </span>
  );
};

export default Icon;
