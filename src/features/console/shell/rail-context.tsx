import * as React from 'react';

type ConsoleRailContextValue = {
  rail: React.ReactNode;
  setRail: (node: React.ReactNode) => void;
};

const ConsoleRailContext = React.createContext<ConsoleRailContextValue | null>(null);

export function ConsoleRailProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [rail, setRail] = React.useState<React.ReactNode>(null);

  return (
    <ConsoleRailContext.Provider value={{ rail, setRail }}>{children}</ConsoleRailContext.Provider>
  );
}

export function useConsoleRail(): React.ReactNode {
  return React.useContext(ConsoleRailContext)?.rail ?? null;
}

/** Stable setter for page components; no-ops outside `ConsoleRailProvider`. */
export function useConsoleRailSetter(): (node: React.ReactNode) => void {
  const ctx = React.useContext(ConsoleRailContext);
  if (!ctx) {
    return noopSetRail;
  }
  return ctx.setRail;
}

function noopSetRail(_node: React.ReactNode): void {}
