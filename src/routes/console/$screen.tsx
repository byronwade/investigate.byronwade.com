import { createFileRoute, redirect } from '@tanstack/react-router';

/** Legacy Paper dump path → reference gallery. */
export const Route = createFileRoute('/console/$screen')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/console/reference/$slug',
      params: { slug: params.screen },
    });
  },
});
