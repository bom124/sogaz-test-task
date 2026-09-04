import { expect, test, type Page } from "@playwright/test";

async function getCardBounds(page: Page) {
  return page.getByTestId(/^card-\d+$/).evaluateAll((cards) =>
    cards.map((card) => {
      const bounds = card.getBoundingClientRect();
      return {
        id: card.getAttribute("data-testid"),
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      };
    }),
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("card-count")).toHaveText("15");
});

test("390px screen has three balanced columns and no horizontal overflow", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const cards = await getCardBounds(page);
  expect(cards).toHaveLength(15);
  expect([...new Set(cards.map(({ x }) => x))]).toEqual([20, 140, 260]);
  expect(new Set(cards.map(({ height }) => height)).size).toBeGreaterThan(3);
  const bottoms = new Map<number, number>();
  const gridTop = cards[0]!.y;
  for (const card of cards) {
    expect(card.width).toBeCloseTo(110, 1);
    const previousBottom = bottoms.get(card.x);
    expect(card.y).toBeCloseTo(previousBottom === undefined ? gridTop : previousBottom + 10, 1);
    bottoms.set(card.x, card.y + card.height);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("collection-390.png") });
});

test("each added card goes into the shortest column without moving existing cards", async ({
  page,
}) => {
  const button = page.getByRole("button", { name: "Добавить карточку", exact: true });
  for (let index = 0; index < 10; index += 1) {
    const before = await getCardBounds(page);
    const bottoms = [20, 140, 260].map((x) => ({
      x,
      bottom: Math.max(
        ...before.filter((card) => card.x === x).map((card) => card.y + card.height),
      ),
    }));
    const shortest = bottoms.reduce((left, right) => (right.bottom < left.bottom ? right : left));
    await button.click();
    await expect(page.getByTestId("card-count")).toHaveText(String(16 + index));
    const after = await getCardBounds(page);
    expect(after.slice(0, before.length)).toEqual(before);
    expect(after.at(-1)?.x).toBe(shortest.x);
    expect(after.at(-1)?.y).toBeCloseTo(shortest.bottom + 10, 1);
  }
  await expect(page.getByRole("status")).toHaveText("Добавлена карточка №25");
});

test("rapid additions retain every card and the last one is reachable by scrolling", async ({
  page,
}) => {
  const button = page.getByRole("button", { name: "Добавить карточку", exact: true });
  for (let index = 0; index < 60; index += 1) await button.click({ delay: 0 });
  await expect(page.getByTestId("card-count")).toHaveText("75");
  const cards = await getCardBounds(page);
  expect(new Set(cards.map(({ id }) => id)).size).toBe(75);
  await page.getByTestId("card-75").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("card-75")).toBeInViewport();
  await expect(button).toBeInViewport();
  const scroll = await page.getByTestId("collection-scroll").evaluate((element) => ({
    top: element.scrollTop,
    height: element.scrollHeight,
    visible: element.clientHeight,
  }));
  expect(scroll.top).toBeGreaterThan(0);
  expect(scroll.height).toBeGreaterThan(scroll.visible);
});

test("width changes keep three columns within screen bounds", async ({ page }) => {
  for (const viewportWidth of [320, 360, 768]) {
    await page.setViewportSize({ width: viewportWidth, height: 844 });
    const expectedWidth = (Math.min(viewportWidth, 390) - 60) / 3;
    await expect
      .poll(async () => (await getCardBounds(page))[0]!.width)
      .toBeCloseTo(expectedWidth, 1);
    const cards = await getCardBounds(page);
    expect(new Set(cards.map(({ x }) => x)).size).toBe(3);
    for (const card of cards) {
      expect(card.x).toBeGreaterThanOrEqual(0);
      expect(card.x + card.width).toBeLessThanOrEqual(viewportWidth);
    }
  }
});

test("add action is available from the keyboard", async ({ page }) => {
  const button = page.getByRole("button", { name: "Добавить карточку", exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("card-count")).toHaveText("16");
});
