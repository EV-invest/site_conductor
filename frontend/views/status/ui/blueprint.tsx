// The isometric "drawing sheet" centrepiece of the Coming Soon screen, rebuilt
// as a technical drawing to match Figma (node 623:14): an oblique navy sheet
// (rotate + skew, not a 3D perspective) with a blueprint grid, a dimensioned EV
// mark (vertical 31.5 m + horizontal 24.00 m with arrowheads), a dashed
// construction circle, an "A" callout, a title block and a DRAFT stamp. Raw
// blueprint blues — the technical-drawing motif has no token equivalent. Sized
// in vw so the whole sheet scales down on small screens.
//
// The EV crown + monogram paths are inlined from shared/ui/logo (the "INVEST"
// wordmark is intentionally omitted) so the mark sits at known SVG coordinates
// and the dimension lines can bound it.
export function Blueprint() {
  return (
    <div aria-hidden className="relative w-[660px] max-w-[88vw]">
      <div className="origin-center [transform:rotate(-8deg)_skewX(14.57deg)_scaleY(0.97)]">
        <div className="overflow-hidden rounded-[2px] border-2 border-[#9bc1ff]/70 bg-[#0a2f6e] shadow-[0_45px_90px_-25px_rgba(0,10,31,0.7)]">
          <svg
            viewBox="0 0 660 440"
            className="block h-auto w-full font-mono-tech"
          >
            <defs>
              <pattern
                id="bp-grid"
                width="22"
                height="22"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M22 0H0V22"
                  fill="none"
                  stroke="rgba(155,193,255,0.16)"
                  strokeWidth="1"
                />
              </pattern>
              <marker
                id="bp-arrow"
                markerWidth="11"
                markerHeight="9"
                refX="8.5"
                refY="4"
                orient="auto-start-reverse"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d="M8.5 0.8 1 4l7.5 3.2"
                  fill="none"
                  stroke="#9bc1ff"
                  strokeWidth="1.2"
                />
              </marker>
            </defs>

            <rect width="660" height="440" fill="url(#bp-grid)" />
            <rect
              x="14"
              y="14"
              width="632"
              height="412"
              fill="none"
              stroke="rgba(155,193,255,0.4)"
              strokeWidth="1"
            />
            <rect
              x="20"
              y="20"
              width="620"
              height="400"
              fill="none"
              stroke="rgba(155,193,255,0.2)"
              strokeWidth="1"
            />

            {[
              [35, 35],
              [625, 35],
              [35, 405],
              [625, 405],
            ].map(([cx, cy]) => (
              <g
                key={`${cx}-${cy}`}
                stroke="rgba(155,193,255,0.55)"
                strokeWidth="1"
              >
                <line x1={cx - 7} y1={cy} x2={cx + 7} y2={cy} />
                <line x1={cx} y1={cy - 7} x2={cx} y2={cy + 7} />
              </g>
            ))}

            <text
              x="52"
              y="122"
              fontSize="64"
              fontWeight="800"
              letterSpacing="9"
              fill="none"
              stroke="rgba(155,193,255,0.28)"
              strokeWidth="1.1"
            >
              DRAFT
            </text>

            <circle
              cx="330"
              cy="215"
              r="132"
              fill="none"
              stroke="rgba(155,193,255,0.5)"
              strokeWidth="1"
              strokeDasharray="5 7"
            />

            {/* EV crown + monogram (white), centred and scaled to the dim box */}
            <g transform="translate(239 150) scale(0.471)" fill="#fff">
              <path d="M0.12 130.84 140.84 112.18V61.75l15.31 3.6v39.44l7.49-1.12V66.66l14.98 2.95v32.74l7.17-1.31V61.09l-29.32-12.77-36.48 12.12v40.6L0.12 130.84Z" />
              <path d="M213.48 112.18l24.1 2.29-.32-113.63-35.18 18.99v53.05l11.4 5.24v34.06Z" />
              <path d="M240.84.84l35.51 19.32v97.58l-15.64-1.97V26.38l-19.87-10.48V.84Z" />
              <path d="M284.82 118.73l101.3 8.51-81.76-17.36V74.19l-19.54-10.48v55.02Z" />
              <path d="M232.62 276.02 166.12 145.84h38.79l51 100.5 51-100.5h39l-66.5 130.18h-46.79Z" />
              <path d="M41.12 276.02h167.22l-12.61-24.68H74.84v-31h105.05l-11.75-23H74.84v-26.5l79.51-.5-12.51-24.5H41.12v130.18Z" />
            </g>

            {/* 31.5 m — vertical dimension on the EV mark height */}
            <g stroke="#9bc1ff" strokeWidth="1.1">
              <line x1="234" y1="150" x2="205" y2="150" />
              <line x1="234" y1="280" x2="205" y2="280" />
              <line
                x1="211"
                y1="150"
                x2="211"
                y2="280"
                markerStart="url(#bp-arrow)"
                markerEnd="url(#bp-arrow)"
              />
            </g>
            <text x="199" y="219" textAnchor="end" fontSize="13" fill="#bcd6ff">
              31.5 m
            </text>

            {/* 24.00 m — horizontal dimension on the EV mark width */}
            <g stroke="#9bc1ff" strokeWidth="1.1">
              <line x1="239" y1="285" x2="239" y2="318" />
              <line x1="421" y1="285" x2="421" y2="318" />
              <line
                x1="239"
                y1="312"
                x2="421"
                y2="312"
                markerStart="url(#bp-arrow)"
                markerEnd="url(#bp-arrow)"
              />
            </g>
            <text
              x="330"
              y="332"
              textAnchor="middle"
              fontSize="13"
              fill="#bcd6ff"
            >
              24.00 m
            </text>

            {/* "A" callout */}
            <line
              x1="561"
              y1="101"
              x2="446"
              y2="150"
              stroke="rgba(155,193,255,0.5)"
              strokeWidth="1"
            />
            <circle
              cx="572"
              cy="92"
              r="13"
              fill="#0a2f6e"
              stroke="#bcd6ff"
              strokeWidth="1"
            />
            <text
              x="572"
              y="96.5"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#bcd6ff"
            >
              A
            </text>

            {/* title block */}
            <g>
              <rect
                x="438"
                y="330"
                width="200"
                height="92"
                fill="#0a2f6e"
                stroke="rgba(155,193,255,0.5)"
                strokeWidth="1"
              />
              <text
                x="450"
                y="352"
                fontSize="11"
                fontWeight="600"
                letterSpacing="0.6"
                fill="#eaf2ff"
              >
                EV INVESTMENT
              </text>
              <line
                x1="450"
                y1="360"
                x2="626"
                y2="360"
                stroke="rgba(155,193,255,0.35)"
                strokeWidth="1"
              />
              <text
                x="450"
                y="378"
                fontSize="9"
                letterSpacing="0.4"
                fill="#bcd6ff"
              >
                DWG · COASTAL TOWER A-04
              </text>
              <text
                x="450"
                y="393"
                fontSize="9"
                letterSpacing="0.4"
                fill="#bcd6ff"
              >
                SCALE 1:100 · REV —
              </text>
              <text
                x="450"
                y="408"
                fontSize="9"
                letterSpacing="0.4"
                fill="#5e9be6"
              >
                STATUS · IN PROGRESS
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
