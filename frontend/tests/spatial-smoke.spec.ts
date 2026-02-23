import {expect, test} from '@playwright/test';

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
