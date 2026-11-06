import { expect, test } from "@playwright/test";

test("Part A exposes every fixture and the active part is visibly underlined", async ({ page }) => {
  await page.goto("/?part=a&fixture=paused");

  const partA = page.getByRole("link", { name: "Part A: Subscription page" });
  await expect(partA).toHaveAttribute("aria-current", "page");
  await expect(partA).toHaveCSS("text-decoration-line", "underline");

  const fixture = page.getByLabel("Subscription fixture");
  await expect(fixture.locator("option")).toHaveText(["Active", "Paused", "Cancelled", "Error"]);
  await expect(fixture).toHaveValue("paused");
  await fixture.selectOption("error");
  await expect(page).toHaveURL(/part=a&fixture=error/);
});

test("theme changes apply to the current part but part navigation resets to its default", async ({
  page,
}) => {
  await page.goto("/?part=b&theme=brand");
  await expect(page.getByLabel("Theme")).toHaveValue("brand");

  await page.getByRole("link", { name: "Part A: Subscription page" }).click();
  await expect(page).toHaveURL(/part=a&fixture=active/);
  await expect(page).not.toHaveURL(/theme=/);
  await expect(page.getByLabel("Theme")).toHaveValue("brand");
  await expect(page.getByLabel("Subscription fixture")).toHaveValue("active");

  await page.getByLabel("Theme").selectOption("part-b");
  await expect(page).toHaveURL(/part=a&fixture=active&theme=part-b/);
  await expect(page.locator("[data-theme='part-b']")).toBeVisible();

  await page.getByRole("link", { name: "Part B: Buy box" }).click();
  await expect(page).toHaveURL(/part=b$/);
  await expect(page).not.toHaveURL(/theme=|fixture=/);
  await expect(page.getByLabel("Theme")).toHaveValue("part-b");
  await expect(page.getByLabel("Subscription fixture")).toHaveCount(0);
});
