import {describe, expect, it, vi} from 'vitest';
import {RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter} from '@tanstack/react-router';
import {render} from '@testing-library/react';
import {axe} from 'jest-axe';
import DockNav from '../DockNav';
import '../../../i18n';

const buildTestRouter = () => {
  const rootRoute = createRootRoute({
    component: () => (
      <DockNav
        isAuthenticated
        isAdmin
        userEmail="admin@roomflow.local"
        theme="dark"
        onToggleTheme={vi.fn()}
        onLogout={vi.fn(async () => {})}
      />
    ),
  });

  const scheduleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/schedule',
  });

  return createRouter({
    routeTree: rootRoute.addChildren([scheduleRoute]),
    history: createMemoryHistory({initialEntries: ['/schedule']}),
  });
};

describe('DockNav accessibility', () => {
  it('has no obvious a11y violations', async () => {
    const router = buildTestRouter();
    const {container} = render(<RouterProvider router={router} />);

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
