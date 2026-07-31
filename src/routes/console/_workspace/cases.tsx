import { createFileRoute } from '@tanstack/react-router';

import { CasesPortfolioPage } from '#/features/console/pages/cases-portfolio-page';

export const Route = createFileRoute('/console/_workspace/cases')({
  component: CasesPortfolioPage,
  head: () => ({
    meta: [{ title: 'Cases portfolio · Investigation Console' }],
  }),
});
