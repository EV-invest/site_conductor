import { cookieName } from "@evinvest/experiments";
import { expect, test, type Page } from "@playwright/test";

import { experiments } from "../shared/config/experiments";

// One visual-regression baseline per section of the site. `name` names the
// screenshot file (__screenshots__/<name>.png); `selector` locates the section.
// The anchored content sections (hero, research, team) are reachable by their
// nav hash, e.g. <baseURL>/#team — those use an id selector. The
// page chrome (header/footer) has no anchor, so it's keyed by tag.
//
// portfolio is embedded from ../_estate/real_estate_allocation. The live wasm bundle IS
// served in the test env, so to get a deterministic baseline we block it (below)
// and screenshot the ShadowDocument snapshot fallback instead — which is ours
// (host-side mount) and the regression guard for the styled-snapshot fix. The
// live interactive element itself is not ours to test.
//
// `on` lists the viewports (playwright.config.ts projects, matched by tag) a
// section is baselined at. Mobile covers the page chrome and the hero — the
// surfaces the funnel work reshapes below `sm` (issue #205); the content
// sections stay desktop-only until their phone layout is worth a baseline of
// its own (portfolio is REA's render, not ours to pin twice).
//
// Adding a section to the site = adding one line here. Nothing else changes.
const SECTIONS = [
  { name: "header", selector: "header", on: ["desktop", "mobile"] },
  { name: "hero", selector: "#hero", on: ["desktop", "mobile"] },
  {
    name: "how-it-works",
    selector: "#how-it-works",
    on: ["desktop", "mobile"],
  },
  { name: "research", selector: "#research", on: ["desktop"] },
  { name: "portfolio", selector: "#portfolio", on: ["desktop"] },
  { name: "partners", selector: "#partners", on: ["desktop"] },
  { name: "team", selector: "#team", on: ["desktop"] },
  { name: "closing-cta", selector: "#closing-cta", on: ["desktop", "mobile"] },
  { name: "footer", selector: "footer", on: ["desktop", "mobile"] },
] as const;

const tags = (on: readonly string[]) => on.map(viewport => `@${viewport}`);
const isMobileProject = () => test.info().project.name === "mobile";

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
  hero_cta: "a",
  team_bio_shade: "a",
  team_office: "a",
};
test.beforeEach(async ({ context, baseURL }) => {
  await context.addCookies(
    Object.entries(BASELINE_VARIANTS).map(([key, value]) => ({
      name: cookieName(key),
      value,
      url: baseURL,
    }))
  );
});

// Web fonts shift glyph metrics, and the CloudFront background images load
// over the network rather than via <img> decode — a baseline is only
// comparable once both have landed.
async function gotoHome(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}

// Opacity reaching 1 is not the same as the motion being over: a staggered
// group's last child, or a split headline's last word, can still be sliding
// while the first is already opaque. `motion` drives these through the Web
// Animations API, so waiting for the document to have nothing running is
// exact — Playwright's own `animations: "disabled"` only freezes CSS.
// Looping decoration (a spinner, a pulse) never finishes and must not be
// waited on — only one-shot entrances count as "still settling". The header
// drawer's CSS transitions surface through the same API, so this covers them too.
async function waitForMotionToSettle(page: Page) {
  await page.waitForFunction(
    () =>
      document
        .getAnimations()
        .every(
          animation =>
            animation.playState !== "running" ||
            animation.effect?.getComputedTiming().iterations === Infinity
        ),
    undefined,
    { timeout: 15_000 }
  );
}

for (const { name, selector, on } of SECTIONS) {
  test(`- mismatch on: ${name}`, { tag: tags(on) }, async ({ page }) => {
    if (name === "portfolio") {
      // Block REA's embed bundle so RemoteElement never upgrades and the
      // ShadowDocument snapshot fallback stays put — a deterministic, wasm-timing-
      // independent target. This is exactly what the styled-snapshot fix renders.
      await page.route(
        /real_estate_allocation_embeds_bg\.wasm|mfe-real-estate-overview\.js/,
        r => r.abort()
      );
    }
    await gotoHome(page);

    // Playwright's CSS locator pierces open shadow roots, so `#portfolio` matches
    // both the light-DOM wrapper and the snapshot's own `id="portfolio"` inside the
    // shadow. The wrapper is their common ancestor → `.first()` in DOM order.
    const section =
      name === "portfolio"
        ? page.locator(selector).first()
        : page.locator(selector);
    await expect(section).toBeVisible();

    if (PIN_TO_TOP.has(name)) {
      await page.evaluate(() => window.scrollTo(0, 0));
    } else {
      // A section taller than the viewport (any long section on mobile) keeps
      // its lower Reveals un-intersected after a top-aligned scroll: their
      // once-only observers never fire and the wait below reads a blank. Walk
      // from the page top to the section's end in viewport-sized steps so
      // every observer above and inside it has seen the viewport (and every
      // lazy image above it has loaded — one that finishes after the capture
      // starts would shift the page under the fixed chrome), then bring the
      // section back into view for the capture — `once` keeps them revealed.
      await section.evaluate(async el => {
        const pause = () => new Promise(r => setTimeout(r, 100));
        const step = Math.max(200, window.innerHeight - 200);
        const bottom =
          el.getBoundingClientRect().top +
          window.scrollY +
          el.getBoundingClientRect().height;
        for (let y = 0; y < bottom; y += step) {
          window.scrollTo({ top: y, behavior: "instant" });
          await pause();
        }
        // Lazy images below the fold never complete, so only wait for those
        // the walk has passed — bounded, in case one of them is broken.
        const passed = Array.from(document.images).filter(
          img =>
            !img.complete &&
            img.getBoundingClientRect().top + window.scrollY < bottom
        );
        await Promise.race([
          Promise.all(
            passed.map(
              img =>
                new Promise<void>(r => {
                  img.onload = img.onerror = () => r();
                })
            )
          ),
          new Promise(r => setTimeout(r, 3000)),
        ]);
      });
      // Playwright's own scroll (the protocol one `toHaveScreenshot` repeats
      // before capturing) ignores CSS scroll-padding, a DOM scrollIntoView
      // honours it — end on the former so the capture's scroll is a no-op.
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
          // A responsive-hidden branch (the mobile carousel at a desktop
          // viewport) is never intersected, so its Reveal holds opacity:0 for
          // good. Unrendered means nothing to reveal, not a dead bundle.
          return !Array.from(root.querySelectorAll("[style*='opacity']")).some(
            el =>
              el.getClientRects().length > 0 &&
              getComputedStyle(el).opacity === "0"
          );
        },
        selector,
        { timeout: 15_000 }
      )
      .catch(() => {
        throw new Error(
          `${name}: content never revealed — client bundle likely never hydrated`
        );
      });

    await waitForMotionToSettle(page);

    if (name === "header" && isMobileProject()) {
      // Below `sm` the bar carries no account chip (it folds into the drawer),
      // so the whole bar is deterministic and there is nothing to clip away.
      // The desktop nav is `hidden` here, which is why the clip below cannot
      // be reused: its right edge has no box.
      await expect(section).toHaveScreenshot(`${name}.png`);
    } else if (name === "header") {
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
      // Fixed chrome overlays whatever sits at the viewport edges — the header
      // (its MFE chip is network-dependent; it has its own test above), Next's
      // dev indicator and the A/B dev panel — and whether it lands inside the
      // element depends on the scroll offset the capture ends on, which is not
      // stable across runs. Hide all three for the capture instead of masking:
      // a mask still records where the chrome was.
      await page.addStyleTag({
        content:
          "header, nextjs-portal, div[style*='2147483647'] { visibility: hidden !important; }",
      });
      await expect(section).toHaveScreenshot(`${name}.png`);
    }
  });
}

// The open drawer is the other half of the mobile header: `data-menu-open` on
// the header root slides the aside in and reveals the scrim (CSS transitions
// on `translate` + `visibility`, no React). Viewport-sized on purpose — the
// composition of scrim, dimmed page and panel is what a reader sees, and the
// panel alone would hide a scrim regression.
test("- mismatch on: header-drawer", { tag: ["@mobile"] }, async ({ page }) => {
  await gotoHome(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await waitForMotionToSettle(page);

  const toggle = page.getByRole("button", { name: "Open menu" });
  // The toggle is wired by the deferred `header-behavior` script; a click that
  // lands before it attaches is a no-op, so retry until the state flips.
  await expect(async () => {
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true", {
      timeout: 500,
    });
  }).toPass({ timeout: 10_000 });
  // The aside carries `aria-label="Site menu"` → role `complementary`.
  const drawer = page.getByRole("complementary", { name: "Site menu" });
  await expect(drawer).toBeVisible();
  await waitForMotionToSettle(page);

  await expect(page).toHaveScreenshot("header-drawer.png");
});

// The funnel's first step (issue #205): a signed-out reader must see a way into
// the cabinet without scrolling or opening the menu. "Primary" is whichever of
// the two entries the page ships — the header pair's `data-cta="open_account"`
// (header-cta.tsx, the name CabinetEntryTracker reports) or the hero's own
// cabinet link — so the assertion holds through either landing first. `href`
// rather than an accessible name because the copy is translated and the
// destination is the contract; the tracker keys on the same href.
for (const viewport of ["desktop", "mobile"] as const) {
  test(
    `- primary cabinet CTA sits inside the first ${viewport} viewport`,
    { tag: [`@${viewport}`] },
    async ({ page }) => {
      await gotoHome(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await waitForMotionToSettle(page);

      const cta = page
        .locator('a[data-cta="open_account"], #hero a[href*="/cabinet/login"]')
        .filter({ visible: true })
        .first();
      await expect(cta).toBeVisible();
      // `ratio: 1` — the whole button, not a sliver peeking above the fold.
      await expect(cta).toBeInViewport({ ratio: 1 });
    }
  );
}

// Issue 39's regression gate. The portfolio section is the one place on the
// landing where the copy belongs to another repo, so it was English under every
// locale's chrome — and English *twice over*, by two independent mechanisms that
// both have to be checked:
//
//   snapshot path — JS off, or the bundle 404s. `portfolio.ru.html`, chosen by
//                   the host at build. Shows permanently, so this is not a flash.
//   wasm path     — the live bundle, which resolves the locale itself off the
//                   page's `lang` (ev_lib::mfe::host_locale). Nothing is passed
//                   to it; a prop or an attribute would arrive too late.
//
// Text, not a screenshot: the point is the language, and a per-locale baseline
// would have to be re-captured on every copy edit in REA.
const RU_PORTFOLIO = "Почему Куинён?";

for (const path of ["snapshot", "wasm"] as const) {
  test(
    `- portfolio reads Russian on /ru (${path})`,
    { tag: ["@desktop"] },
    async ({ page }) => {
      if (path === "snapshot") {
        await page.route(
          /real_estate_allocation_embeds_bg\.wasm|mfe-real-estate-overview\.js/,
          r => r.abort()
        );
      }
      await page.goto("/ru");
      // `evaluate`, not `locator("html")`: on the snapshot path that selector
      // pierces the shadow root and matches two documents — the page's and the
      // snapshot's. Which is the proof the right file was picked, asserted below.
      expect(await page.evaluate(() => document.documentElement.lang)).toBe(
        "ru"
      );

      const section = page.locator("#portfolio").first();
      await section.scrollIntoViewIfNeeded();
      if (path === "snapshot") {
        // The host chose `portfolio.ru.html`, so the adopted document carries its
        // own `lang="ru"`. A regression to a single snapshot shows up here as `en`
        // rather than as copy that merely looks wrong.
        await expect(section.locator("html")).toHaveAttribute("lang", "ru");
      }
      // `getByText` pierces open shadow roots, so this reads the snapshot's copy
      // through ShadowDocument's root as readily as the live element's light DOM.
      await expect(section.getByText(RU_PORTFOLIO).first()).toBeVisible({
        timeout: 15_000,
      });
    }
  );
}
