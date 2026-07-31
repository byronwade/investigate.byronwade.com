import { createFileRoute, Link } from '@tanstack/react-router';
import type * as React from 'react';

import { type ConsoleScreenMeta, consoleScreens } from '#/features/console/screens/registry';

export const Route = createFileRoute('/console/reference/')({
  component: ReferenceGalleryPage,
});

const GROUP_ORDER: readonly ConsoleScreenMeta['group'][] = [
  'case',
  'workspace',
  'media',
  'system',
  'foundations',
];

const GROUP_LABELS: Record<ConsoleScreenMeta['group'], string> = {
  case: 'Case',
  workspace: 'Workspace',
  media: 'Media',
  system: 'System',
  foundations: 'Foundations',
};

function screensByGroup(): Array<{
  group: ConsoleScreenMeta['group'];
  label: string;
  screens: ConsoleScreenMeta[];
}> {
  return GROUP_ORDER.map((group) => ({
    group,
    label: GROUP_LABELS[group],
    screens: consoleScreens.filter((screen) => screen.group === group),
  })).filter((section) => section.screens.length > 0);
}

function ReferenceGalleryPage(): React.JSX.Element {
  const sections = screensByGroup();

  return (
    <main
      id="console-main"
      tabIndex={-1}
      className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 outline-none"
    >
      <p className="font-[family-name:var(--console-font-mono)] text-[11px] tracking-[0.06em] text-[var(--console-muted)]">
        PAPER REFERENCE
      </p>
      <h1 className="mt-2 font-[family-name:var(--console-font-sans)] text-[22px] font-semibold leading-7 tracking-[-0.02em] text-[var(--console-ink)]">
        Desk screen gallery
      </h1>
      <p className="mt-3 max-w-xl text-[13px] leading-5 text-[var(--console-body)]">
        Exact Paper artboard dumps for visual parity. Product navigation stays on case routes; these
        screens are reference-only.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.group} aria-labelledby={`ref-group-${section.group}`}>
            <h2
              id={`ref-group-${section.group}`}
              className="border-b border-[var(--console-hairline)] pb-2 text-[12px] font-medium text-[var(--console-muted)]"
            >
              {section.label}
              <span className="ml-2 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                {section.screens.length}
              </span>
            </h2>
            <ul className="mt-2 flex flex-col gap-px">
              {section.screens.map((screen) => (
                <li key={screen.slug}>
                  <Link
                    to="/console/reference/$slug"
                    params={{ slug: screen.slug }}
                    className="flex h-8 items-center justify-between gap-3 rounded-md px-2 text-[13px] text-[var(--console-body)] hover:bg-[var(--console-row-active)] hover:text-[var(--console-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--console-ink)]"
                  >
                    <span className="min-w-0 truncate">{screen.title}</span>
                    <span className="shrink-0 font-[family-name:var(--console-font-mono)] text-[11px] text-[var(--console-muted)]">
                      {screen.paperId}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
