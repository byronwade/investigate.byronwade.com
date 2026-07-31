import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Legacy Paper dump path. Task 7 registers `/console/reference/$slug`;
 * redirect lightly so bookmarks land on the gallery when that ships.
 */
export const Route = createFileRoute('/console/$screen')({
  beforeLoad: ({ params }) => {
    throw redirect({
      href: `/console/reference/${encodeURIComponent(params.screen)}`,
    });
  },
});
