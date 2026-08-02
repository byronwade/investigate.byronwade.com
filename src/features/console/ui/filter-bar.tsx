import type * as React from 'react';

import { cn } from '#/lib/utils';

export function FilterBar({
  options,
  value,
  onChange,
  legend = 'Filters',
  className,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  legend?: string;
  className?: string;
}): React.JSX.Element {
  return (
    <fieldset className={cn('flex flex-wrap gap-2 border-0 p-0', className)}>
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className="console-filter"
          aria-pressed={value === option}
        >
          {option}
        </button>
      ))}
    </fieldset>
  );
}
