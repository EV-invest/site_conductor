// `publication` entity — the single read surface over the publications
// catalogue (research reports, the whitepaper, field notes) that /publications,
// its detail routes and the sitemap share.
//
// The catalogue itself is build-produced and deliberately not exported: callers
// ask questions (`findPublication`, `fieldNotes`, …) instead of scanning an
// array, so the storage can move behind these names without touching consumers.
export type { Cover, Publication, PublicationKind } from "./model/types";
export { coverPoster, youtubePosterUrl } from "./model/types";
export {
  allPublications,
  fieldNotes,
  findPublication,
  formatPublicationDate,
  hasCover,
  latestPublications,
  publicationsByKind,
} from "./model/selectors";
