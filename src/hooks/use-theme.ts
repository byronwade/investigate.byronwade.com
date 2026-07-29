import { useEffect, useState } from 'react';
import { applyTheme, getPreferredTheme, type Theme, toggleTheme } from '#/lib/client/theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const preferred = getPreferredTheme();
    setTheme(preferred);
    applyTheme(preferred);
  }, []);

  const set = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  const toggle = () => {
    set(toggleTheme(theme));
  };

  return { theme, setTheme: set, toggleTheme: toggle };
}
