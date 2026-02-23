import {expect, test, type Page} from '@playwright/test';

const scheduleResponse = {
  timeSlots: [
    {
      time: '10:00',
      rooms: [
        {roomId: 'room-a', roomName: 'Комната A', capacity: 8, floor: 2, isAvailable: true},
        {roomId: 'room-b', roomName: 'Комната B', capacity: 6, floor: 1, isAvailable: true},
      ],
    },
    {
      time: '10:30',
      rooms: [
        {roomId: 'room-a', roomName: 'Комната A', capacity: 8, floor: 2, isAvailable: true},
        {roomId: 'room-b', roomName: 'Комната B', capacity: 6, floor: 1, isAvailable: false},
      ],
    },
  ],
};

const createJwt = (roles: string[], sub = 'user@roomflow.local') => {
  const header = Buffer.from(JSON.stringify({alg: 'HS256', typ: 'JWT'})).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub,
      roles,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    })
  ).toString('base64url');

  return `${header}.${payload}.signature`;
};

const mockAuthMe = async (page: Page, roles: string[], email = 'user@roomflow.local') => {
  await page.route('**/api/v1/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'u-1',
        email,
        roles,
      }),
    });
  });
};

test.beforeEach(async ({page}) => {
  await page.route('**/api/v1/schedule**', async (route) => {
    await route.fulfill({status: 200, contentType: 'application/json', body: JSON.stringify(scheduleResponse)});
  });

  await page.route('**/api/v1/auth/refresh', async (route) => {
    await route.fulfill({status: 401, contentType: 'application/json', body: JSON.stringify({message: 'no refresh'})});
  });
});

test('schedule page renders visible room field content', async ({page}) => {
  await page.goto('/schedule');
  await expect(page.getByRole('heading', {name: 'Бронирование'})).toBeVisible();
  await expect(page.locator('[data-room-id="room-a"]').first()).toBeVisible();
});

test('route /schedule/room/:id opens room detail flow and can return', async ({page}) => {
  await page.goto('/schedule/room/room-a');
  await expect(page).toHaveURL(/\/schedule\/room\/room-a/);
  await expect(page.getByRole('button', {name: /Назад/})).toBeVisible();
  await page.getByRole('button', {name: /Назад/}).click();
  await expect(page).toHaveURL('/schedule');
});

test('invalid room deep-link redirects back to /schedule', async ({page}) => {
  await page.goto('/schedule/room/unknown-room');
  await expect(page).toHaveURL('/schedule');
});

test('my-bookings deep-link renders overlay in scene runtime', async ({page}) => {
  await page.addInitScript((token) => {
    window.localStorage.setItem('authToken', token);
  }, createJwt(['ROLE_USER']));

  await mockAuthMe(page, ['ROLE_USER']);
  await page.route('**/api/v1/my-bookings', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'b-1',
          roomId: 'room-a',
          roomName: 'Комната A',
          startTime: '2026-02-23T10:00:00',
          endTime: '2026-02-23T10:30:00',
          status: 'CONFIRMED',
        },
      ]),
    });
  });

  await page.goto('/my-bookings');
  await expect(page).toHaveURL('/my-bookings');
  await expect(page.getByRole('heading', {name: 'Мои бронирования'})).toBeVisible();
  await expect(page.getByText('fallback-режиме')).not.toBeVisible();
});

test('admin deep-link renders overlay for admin user', async ({page}) => {
  await page.addInitScript((token) => {
    window.localStorage.setItem('authToken', token);
  }, createJwt(['ROLE_ADMIN'], 'admin@roomflow.local'));

  await mockAuthMe(page, ['ROLE_ADMIN'], 'admin@roomflow.local');
  await page.route('**/api/v1/admin/users', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{id: 'u-2', email: 'member@roomflow.local', roles: ['ROLE_USER']}]),
    });
  });

  await page.goto('/admin');
  await expect(page).toHaveURL('/admin');
  await expect(page.getByText('God Mode')).toBeVisible();
  await expect(page.getByText('member@roomflow.local')).toBeVisible();
});

test('admin deep-link redirects non-admin user to /schedule', async ({page}) => {
  await page.addInitScript((token) => {
    window.localStorage.setItem('authToken', token);
  }, createJwt(['ROLE_USER']));

  await mockAuthMe(page, ['ROLE_USER']);

  await page.goto('/admin');
  await expect(page).toHaveURL('/schedule');
});
