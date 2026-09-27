import type { Translate } from "@evinvest/i18n";

// Captured from the cabinet on its BFF stub (banking origin/main, demo data) at
// deviceScaleFactor 2, so `width`/`height` are CSS pixels — half the file's
// pixel size. Both are set explicitly: the frame is reserved before the image
// arrives, so the section never shifts (issue #200).
export type Shot = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const shots = (t: Translate) => {
  const homeAlt = t(
    "home.cabinetTour.shot.home",
    "Cabinet home: portfolio value, NAV history with your own participation drawn on it, and recent activity (demo data)"
  );
  return {
    home: {
      src: "/assets/cabinet/home-desktop.png",
      width: 1440,
      height: 900,
      alt: homeAlt,
    },
    // Same screen at phone width; art-directed in via <picture> rather than
    // shrinking the desktop frame to 390px, where nothing would be legible.
    homeMobile: {
      src: "/assets/cabinet/home-mobile.png",
      width: 390,
      height: 844,
      alt: homeAlt,
    },
    invest: {
      src: "/assets/cabinet/invest-desktop.png",
      width: 1440,
      height: 900,
      alt: t(
        "home.cabinetTour.shot.invest",
        "Invest: the product catalogue with your units, value and P&L per fund (demo data)"
      ),
    },
    profile: {
      src: "/assets/cabinet/profile-desktop.png",
      width: 1440,
      height: 900,
      alt: t(
        "home.cabinetTour.shot.profile",
        "Profile: verified identity, account standing and the devices signed in (demo data)"
      ),
    },
  } satisfies Record<string, Shot>;
};
