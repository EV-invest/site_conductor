import { cookieName } from "@evinvest/experiments";
import { expect, test } from "@playwright/test";

import { experiments } from "../shared/config/experiments";

// One visual-regression baseline per section of the site. `name` names the
// screenshot file (__screenshots__/<name>.png); `selector` locates the section.
// The anchored content sections (hero, research, team) are reachable by their
// nav hash, e.g. <baseURL>/#team — those use an id selector. The
// page chrome (header/footer) has no anchor, so it's keyed by tag.
//
// portfolio/calculator are embedded from ../real_estate_allocation and not ours
// to test.
//
// Adding a section to the site = adding one line here. Nothing else changes.
const SECTIONS = [
  { name: "header", selector: "header" },
  { name: "hero", selector: "#hero" },
  { name: "research", selector: "#research" },
  { name: "team", selector: "#team" },
  { name: "footer", selector: "footer" },
] as const;

// The hero scales its background with window.scrollY; pinning the scroll
// position makes its zoom (and the header's blur-on-scroll state) deterministic.
// Top-of-page for the chrome sections, the element itself otherwise.
const PIN_TO_TOP = new Set<string>(["header", "hero"]);

// A/B experiments assign per fresh context (weighted random, sticky cookie), so
// an unpinned run screenshots a random variant. Pin every experiment to the
// variant the committed baselines were captured from.
const BASELINE_VARIANTS: { [K in keyof typeof experiments]: string } = {
  hero: "a",
  hero_headline: "b",
  team_office: "a",
  team_bio_shade: "a",
};
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies(
    Object.entries(BASELINE_VARIANTS).map(([key, value]) => ({
      name: cookieName(key),
      value,
      url: baseURL,
    })),
  );
});

for (const { name, selector } of SECTIONS) {
  test(`- mismatch on: ${name}`, async ({ page }) => {
    await page.goto("/");

    // Web fonts shift glyph metrics; wait until they're applied.
    await page.evaluate(() => document.fonts.ready);
    // CloudFront background images load over the network, not via <img> decode.
    await page.waitForLoadState("networkidle");

    const section = page.locator(selector);
    await expect(section).toBeVisible();

    if (PIN_TO_TOP.has(name)) {
      await page.evaluate(() => window.scrollTo(0, 0));
    } else {
      await section.scrollIntoViewIfNeeded();
    }
    // Let the scroll-driven transform settle to its resting frame.
    await page.waitForTimeout(150);

    await expect(section).toHaveScreenshot(`${name}.png`);
  });
}
