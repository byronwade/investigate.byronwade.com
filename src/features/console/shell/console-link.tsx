import { Link } from '@tanstack/react-router';
import type * as React from 'react';

type ConsoleLinkProps = {
  to: string;
  className?: string;
  children: React.ReactNode;
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
 * Link wrapper for console chrome. Case routes land in Task 4; until the
 * route tree types them, we pass absolute path strings through Link.
 */
export function ConsoleLink({
  to,
  className,
  children,
  activeProps,
  activeOptions,
  ...rest
}: ConsoleLinkProps): React.JSX.Element {
  return (
    <Link
      to={to as never}
      className={className}
      {...(activeProps ? { activeProps } : {})}
      {...(activeOptions ? { activeOptions } : {})}
      {...rest}
    >
      {children}
    </Link>
  );
}
