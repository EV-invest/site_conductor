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

    // Reveal wrappers SSR at opacity:0 and only animate in client-side; a dead
    // bundle (dev server mid-restart, chunk 404s) screenshots a structurally
    // valid but blank section. Fail loud instead of diffing a void.
    await page
      .waitForFunction(
        sel => {
          const root = document.querySelector(sel);
          if (!root) return false;
          return !Array.from(root.querySelectorAll("[style*='opacity']")).some(
            el => getComputedStyle(el).opacity === "0",
          );
        },
        selector,
        { timeout: 15_000 },
      )
      .catch(() => {
        throw new Error(
          `${name}: content never revealed — client bundle likely never hydrated`,
        );
      });

    if (name === "header") {
      // The header CTA is the cabinet-served MFE account chip, present only
      // when that service is reachable — clip at the nav's right edge so the
      // baseline is independent of it.
      const header = await section.boundingBox();
      const nav = await page.locator("header nav").first().boundingBox();
      if (!header || !nav) throw new Error("header/nav has no bounding box");
      await expect(page).toHaveScreenshot(`${name}.png`, {
        clip: {
          x: header.x,
          y: header.y,
          width: nav.x + nav.width - header.x,
          height: header.height,
        },
      });
    } else {
      // The fixed header overlays whatever sits at the viewport top, leaking
      // its MFE chip (network-dependent) into section baselines — mask it; it
      // has its own test above.
      await expect(section).toHaveScreenshot(`${name}.png`, {
        mask: [page.locator("header")],
      });
    }
  });
}
