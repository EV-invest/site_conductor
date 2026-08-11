// Public API of the motion slice. Import from `@/shared/ui/motion`, never from
// a file inside it — the internals (tokenizer, variant shapes) are free to move.
//
// Three primitives cover this surface:
//   Reveal      — one block fades/rises into view
//   Stagger     — a row or grid arrives in sequence (+ StaggerItem per child)
//   SplitText   — a display headline assembles word by word
//
// All three respect `prefers-reduced-motion`, animate only compositor
// properties, and run once. Timing and curves come from ./tokens.
export { Reveal, type RevealFrom, type RevealProps } from "./reveal";
export {
  Stagger,
  StaggerItem,
  type StaggerItemProps,
  type StaggerProps,
} from "./stagger";
export { SplitText, type SplitTextProps } from "./split-text";
export { DUR, EASE, RISE, STAGGER, STAGGER_TEXT, VIEWPORT } from "./tokens";
