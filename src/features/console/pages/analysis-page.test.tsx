import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DEFAULT_CASE_ID } from '#/features/console/data';

import { AnalysisPage } from './analysis-page';

describe('AnalysisPage', () => {
  it('renders board columns and items', () => {
    render(<AnalysisPage caseId={DEFAULT_CASE_ID} />);

    expect(screen.getByRole('heading', { name: /Analysis board/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Supported$/i })).toBeInTheDocument();
    expect(screen.getByText(/Invoice 8812 over peer awards/i)).toBeInTheDocument();
    expect(screen.getByText(/Osei tip vs. absence of record/i)).toBeInTheDocument();
  });

  it('returns null for unknown cases', () => {
    const { container } = render(<AnalysisPage caseId="missing-case" />);
    expect(container).toBeEmptyDOMElement();
  });
});
