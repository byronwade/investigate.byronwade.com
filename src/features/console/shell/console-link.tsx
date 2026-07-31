import { Link } from '@tanstack/react-router';
import type * as React from 'react';

type ConsoleLinkProps = {
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  activeProps?: {
    className?: string;
    'aria-current'?: 'page';
  };
  activeOptions?: {
    exact?: boolean;
    includeHash?: boolean;
    includeSearch?: boolean;
  };
  'aria-current'?: 'page';
};

/**
 * Link wrapper for console chrome. Paths are absolute strings under `/console`.
 */
export function ConsoleLink({
  to,
  className,
  children,
  onClick,
  activeProps,
  activeOptions,
  ...rest
}: ConsoleLinkProps): React.JSX.Element {
  return (
    <Link
      to={to as never}
      className={className}
      {...(onClick ? { onClick } : {})}
      {...(activeProps ? { activeProps } : {})}
      {...(activeOptions ? { activeOptions } : {})}
      {...rest}
    >
      {children}
    </Link>
  );
}
