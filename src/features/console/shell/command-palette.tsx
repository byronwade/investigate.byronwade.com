'use client';

import { useNavigate } from '@tanstack/react-router';
import type * as React from 'react';
import { useEffect, useState } from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command';
import type { CaseId } from '#/features/console/data';

import { caseTabs, resolveCaseNavTo } from './nav';

type CommandPaletteProps = {
  caseId: CaseId;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CommandPalette({
  caseId,
  open: openControlled,
  onOpenChange,
}: CommandPaletteProps): React.JSX.Element {
  const [openUncontrolled, setOpenUncontrolled] = useState(false);
  const open = openControlled ?? openUncontrolled;
  const setOpen = onOpenChange ?? setOpenUncontrolled;
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, setOpen]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Jump to a case page or run a task"
    >
      <CommandInput placeholder="Ask the case, or jump to a page…" />
      <CommandList>
        <CommandEmpty>No matching commands.</CommandEmpty>
        <CommandGroup heading="Case pages">
          {caseTabs.map((item) => (
            <CommandItem
              key={item.to}
              value={item.label}
              onSelect={() => {
                void navigate({ href: resolveCaseNavTo(item.to, caseId) });
                setOpen(false);
              }}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
