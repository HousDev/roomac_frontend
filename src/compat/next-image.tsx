import React from 'react';

type NextImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function Image({
  src,
  alt,
  width,
  height,
  fill,
  className,
  style,
  ...rest
}: NextImageProps) {
  const resolvedSrc = typeof src === 'string' ? src : (src as { src?: string })?.src ?? '';
  const imgStyle: React.CSSProperties = fill
    ? { position: 'absolute', height: '100%', width: '100%', objectFit: 'cover', ...style }
    : { ...style };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={imgStyle}
      loading="lazy"
      {...rest}
    />
  );
}
