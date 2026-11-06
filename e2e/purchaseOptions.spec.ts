import { expect, test } from "@playwright/test";

const subscribeCard = "fieldset > div:has(input[type='radio']):nth-of-type(2)";

test("switching purchase option eases the subscription card height instead of jumping", async ({
  page,
}) => {
  await page.goto("/?part=b");
  const card = page.locator(subscribeCard);
  const expanded = (await card.boundingBox())!.height;

  const midway = await page.evaluate((selector) => {
    const element = document.querySelector<HTMLElement>(selector)!;
    document.querySelector<HTMLInputElement>("fieldset input[type='radio']")!.click();
    return new Promise<number>((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => resolve(element.getBoundingClientRect().height)),
      ),
    );
  }, subscribeCard);

  await expect(page.getByLabel("Delivered every")).toBeHidden();
  const collapsed = (await card.boundingBox())!.height;
  expect(collapsed).toBeLessThan(expanded);
  expect(midway).toBeGreaterThan(collapsed + 1);
  expect(midway).toBeLessThan(expanded);
});

test("collapsed subscription details stay out of reach until subscribe is chosen again", async ({
  page,
}) => {
  await page.goto("/?part=b");
  await page.getByRole("radio", { name: /One-time purchase/ }).check();
  await expect(page.getByLabel("Delivered every")).toBeHidden();
  await expect(page.getByText("Free shipping on every order")).toBeHidden();

  await page.getByRole("radio", { name: /One-time purchase/ }).focus();
  await page.keyboard.press("Tab");
  const focusLeftOptions = await page.evaluate(
    () => document.activeElement?.closest("fieldset") === null,
  );
  expect(focusLeftOptions).toBe(true);

  await page.getByRole("radio", { name: /Subscribe/ }).check();
  await expect(page.getByLabel("Delivered every")).toBeVisible();
  await page.getByRole("radio", { name: /Subscribe/ }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Delivered every")).toBeFocused();
});
