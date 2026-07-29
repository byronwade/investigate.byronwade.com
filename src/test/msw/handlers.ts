import { HttpResponse, http } from 'msw';

/** Representative MSW handlers for future network-backed features. */
export const handlers = [
  http.get('https://example.invalid/health', () => {
    return HttpResponse.json({ ok: true });
  }),
];
