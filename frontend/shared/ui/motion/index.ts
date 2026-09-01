// Public API of the motion slice. Import from `@/shared/ui/motion`, never from
// a file inside it — the internals (tokenizer, variant shapes) are free to move.
//
// Four primitives cover this surface:
//   Reveal      — one block fades/rises into view
//   Stagger     — a row or grid arrives in sequence (+ StaggerItem per child)
//   SplitText   — a display headline assembles word by word
//   CountUp     — a figure counts up to its value
//
// All four respect `prefers-reduced-motion` and run once. The first three
// animate only compositor properties; CountUp writes text, and keeps that off
// React by mutating one node directly. Timing and curves come from ./tokens.
export { Reveal, type RevealFrom, type RevealProps } from "./reveal";
export {
  Stagger,
  StaggerItem,
  type StaggerItemProps,
  type StaggerProps,
} from "./stagger";
export { SplitText, type SplitTextProps } from "./split-text";
export { CountUp, type CountUpProps } from "./count-up";
export {
  DUR,
  EASE,
  RISE,
  STAGGER,
  STAGGER_TEXT,
  VIEWPORT,
  VIEWPORT_Y,
} from "./tokens";
