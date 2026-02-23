import {describe, expect, it, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {render} from '@testing-library/react';
import {axe} from 'jest-axe';
import DockNav from '../DockNav';
import '../../../i18n';

describe('DockNav accessibility', () => {
  it('has no obvious a11y violations', async () => {
    const {container} = render(
      <MemoryRouter>
        <DockNav
          isAuthenticated
          isAdmin
          userEmail="admin@roomflow.local"
          theme="dark"
          onToggleTheme={vi.fn()}
          onLogout={vi.fn(async () => {})}
        />
      </MemoryRouter>
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
