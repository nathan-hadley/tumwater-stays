import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("homepage loads with hero and nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: "Tumwater Stays" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("booking section renders date picker", async ({ page }) => {
    await page.goto("/#booking");
    await expect(page.getByRole("heading", { name: "Book Your Stay" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Select Dates" })).toBeVisible();
  });

  test("mobile nav opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const openButton = page.getByRole("button", { name: "Open menu" });
    await expect(openButton).toBeVisible();
    await openButton.click();

    const closeButton = page.getByRole("button", { name: "Close menu" });
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("unknown route renders 404 page", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/404|not found/i).first()).toBeVisible();
  });
});
