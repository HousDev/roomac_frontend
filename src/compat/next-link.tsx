import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

type NextLinkProps = Omit<RouterLinkProps, 'to'> & { href: string; children?: React.ReactNode };

export default function Link({ href, children, ...rest }: NextLinkProps) {
  return <RouterLink to={href} {...rest}>{children}</RouterLink>;
}
