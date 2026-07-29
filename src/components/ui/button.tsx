import type { ButtonHTMLAttributes } from 'react';
import { cn } from '#/lib/shared/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-primary)] text-[var(--color-primary-fg)] hover:brightness-105 shadow-[var(--shadow-sm)]',
  secondary:
    'bg-[var(--color-bg-elevated)] text-[var(--color-fg)] border border-[var(--color-border)] hover:bg-[color-mix(in_oklab,var(--color-bg-elevated),var(--color-neutral-100)_35%)]',
  ghost:
    'bg-transparent text-[var(--color-fg)] hover:bg-[color-mix(in_oklab,var(--color-fg)_6%,transparent)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-[length:var(--text-sm)]',
  md: 'h-11 px-4 text-[length:var(--text-base)]',
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold transition-[filter,background-color,transform] duration-[var(--duration-fast)] disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
