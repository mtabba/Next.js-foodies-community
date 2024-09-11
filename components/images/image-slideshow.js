'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import classes from './image-slideshow.module.css';

const imagesContext = require.context(
  '@/public/images',
  true,
  /\.(jpg|jpeg|png)$/
);
const images = [];

imagesContext.keys().forEach((image) => {
  const imageUrl = imagesContext(image);
  const altText = image.replace(/\.jpg|jpeg|png$/, '').replace(/-/g, ' ');
  images.push({ image: imageUrl, alt: altText });
});

export default function ImageSlideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < images.length - 1 ? prevIndex + 1 : 0
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={classes.slideshow}>
      {images.map((image, index) => (
        <Image
          key={index}
          src={image.image}
          className={index === currentImageIndex ? classes.active : ''}
          alt={image.alt}
        />
      ))}
    </div>
  );
}
