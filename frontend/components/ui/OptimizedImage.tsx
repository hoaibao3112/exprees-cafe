'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  fallbackSrc?: string;
}

export function OptimizedImage({
  src,
  fallbackSrc = '/slideshow_2.jpg',
  alt,
  fill,
  sizes,
  className,
  priority,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || 'Image'}
      fill={fill}
      sizes={sizes}
      className={className}
      priority={priority}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
