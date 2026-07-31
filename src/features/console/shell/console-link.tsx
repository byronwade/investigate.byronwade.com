import { Link } from '@tanstack/react-router';
import type * as React from 'react';

type ConsoleLinkProps = {
  to: string;
  className?: string;
  children: React.ReactNode;
  'aria-current'?: 'page' | undefined;
};

/**
 * Link wrapper for console chrome. Case routes land in Task 4; until the
 * route tree types them, we pass absolute path strings through Link.
 */
export function ConsoleLink({
  to,
  className,
  children,
  ...rest
}: ConsoleLinkProps): React.JSX.Element {
  return (
    <Link to={to as never} className={className} {...rest}>
      {children}
    </Link>
  );
}
