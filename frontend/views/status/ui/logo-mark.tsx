// The EV skyline crown — the rooftop silhouette of the brand logo (Figma uikit
// node 17:3, wordmark omitted), filled with `currentColor` so it inherits the
// status accent.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 48" className={className} aria-hidden>
      <g fill="currentColor">
        <path d="M0.0437012 47.3326L50.9499 40.5805V22.3378L56.4881 23.6408V37.9071L59.1984 37.5005V24.1147L64.6189 25.1808V37.0269L67.2113 36.553V22.1009L56.606 17.481L43.408 21.864V36.553L0.0437012 47.3326Z" />
        <path d="M77.2277 40.5804L85.9478 41.4099L85.8299 0.304321L73.1033 7.17499V26.3654L77.2277 28.2608V40.5804Z" />
        <path d="M87.126 0.304321L99.9705 7.29343V42.5943L94.3141 41.8835V9.54417L87.126 5.75347V0.304321Z" />
        <path d="M103.034 42.9496L139.682 46.0296L110.104 39.7513V26.8393L103.034 23.0486V42.9496Z" />
      </g>
    </svg>
  );
}
