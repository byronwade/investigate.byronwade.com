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
    <fieldset className={cn('-mx-1 border-0 p-0', className)}>
      <legend className="sr-only">{legend}</legend>
      <div className="console-h-scroll flex gap-2 overflow-x-auto px-1 pb-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="console-filter shrink-0"
            aria-pressed={value === option}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
