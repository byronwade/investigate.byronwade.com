(() => {
  let key = 'investigate-theme';
  let theme = 'light';
  try {
    key = 'investigate-theme';
    const stored = localStorage.getItem(key);
    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = theme;
  }
})();
