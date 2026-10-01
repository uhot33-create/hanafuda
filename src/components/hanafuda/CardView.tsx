import type { ReactNode } from "react";
import type { Card } from "@/game/types";

const INK = "#1a120c";
const PAPER = "#fbf6ea";
const RED = "#d0121c";
const GOLD = "#e2b33a";
const PINE = "#1c7a3c";
const PINE_DEEP = "#0e5a2c";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function Sheet() {
  return <rect width="120" height="180" fill={PAPER} />;
}

function Rim() {
  return <rect x="1.4" y="1.4" width="117.2" height="177.2" rx="7" fill="none" stroke={INK} strokeWidth="2.4" />;
}

function PineFan({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 2 C-16 -6 -20 -28 0 -40 C20 -28 16 -6 0 2 Z" fill={PINE_DEEP} stroke={INK} strokeWidth="1" />
      <path d="M0 0 C-10 -8 -12 -26 0 -34 C12 -26 10 -8 0 0 Z" fill={PINE} />
      <path d="M0 -2 L0 -30" stroke="#d8ead4" strokeWidth="1" />
    </g>
  );
}

function PineSpray({ shift = 0 }: { shift?: number }) {
  const fans: Array<[number, number, number]> = [
    [22, 158, 1.05],
    [58, 132, 1.2],
    [96, 108, 0.95],
    [36, 96, 0.85],
    [78, 64, 0.9],
    [28, 48, 0.7],
  ];
  return (
    <g>
      <path
        d="M6 172 C36 140 48 100 108 18"
        fill="none"
        stroke="#6a4324"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {fans.map(([x, y, s], i) => (
        <PineFan key={i} x={x + (i % 2 ? shift : -shift)} y={y} s={s} />
      ))}
    </g>
  );
}

function Blossom({
  x,
  y,
  r = 8,
  fill = "#f4b7c6",
}: {
  x: number;
  y: number;
  r?: number;
  fill?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy={-r * 0.45}
          rx={r * 0.42}
          ry={r * 0.5}
          fill={fill}
          stroke={INK}
          strokeWidth="0.6"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r={r * 0.22} fill="#f0d15c" stroke={INK} strokeWidth="0.5" />
    </g>
  );
}

function PlumBranch({ shift = 0 }: { shift?: number }) {
  const spots: Array<[number, number, number]> = [
    [24, 48, 9],
    [52, 36, 8],
    [86, 28, 10],
    [34, 88, 8],
    [70, 78, 11],
    [102, 70, 7],
    [48, 128, 9],
    [88, 124, 8],
  ];
  return (
    <g>
      <path d="M-4 150 C30 120 40 70 118 22" fill="none" stroke="#2a1c16" strokeWidth="6" strokeLinecap="round" />
      <path d="M46 108 C70 90 78 78 96 60" fill="none" stroke="#2a1c16" strokeWidth="4" strokeLinecap="round" />
      {spots.map(([x, y, r], i) => (
        <Blossom key={i} x={x + (i % 2 ? shift : 0)} y={y} r={r} fill={i % 2 ? "#f7c4d0" : "#ee9aaf"} />
      ))}
    </g>
  );
}

function CherryCloud({ shift = 0 }: { shift?: number }) {
  const spots: Array<[number, number]> = [
    [22, 30],
    [48, 22],
    [78, 28],
    [104, 40],
    [30, 62],
    [62, 54],
    [96, 68],
    [18, 100],
    [50, 96],
    [84, 108],
    [36, 140],
    [72, 148],
    [108, 132],
  ];
  return (
    <g>
      <path d="M8 16 C40 40 70 20 112 48" fill="none" stroke="#5c3a32" strokeWidth="3" />
      {spots.map(([x, y], i) => (
        <Blossom key={i} x={x} y={y + (i % 3 === 0 ? shift : 0)} r={i % 2 ? 6 : 7.5} fill={i % 2 ? "#f8d5df" : "#f3b4c4"} />
      ))}
    </g>
  );
}

function Wisteria({ shift = 0 }: { shift?: number }) {
  const vines = [
    [24, 8, 8],
    [52, 4, 10],
    [82, 10, 9],
    [106, 6, 7],
  ] as const;
  return (
    <g>
      <path d="M8 14 H112" stroke="#3e6a34" strokeWidth="4" />
      {vines.map(([x, y, n], i) => (
        <g key={x}>
          {Array.from({ length: n }).map((_, k) => (
            <ellipse
              key={k}
              cx={x + (k % 2 ? 3 : -2) + (i === 1 ? shift : 0)}
              cy={y + 18 + k * 14}
              rx="8"
              ry="7"
              fill={k % 2 ? "#6d429e" : "#8d62be"}
              stroke={INK}
              strokeWidth="0.7"
            />
          ))}
        </g>
      ))}
    </g>
  );
}

function IrisBed({ shift = 0 }: { shift?: number }) {
  const stalks = [18, 42, 66, 92, 112];
  return (
    <g>
      <rect width="120" height="180" fill="#e7f2ea" />
      {stalks.map((x, i) => (
        <path
          key={x}
          d={`M${x} 180 C${x - 6} 110 ${x + 8} 70 ${x + (i % 2 ? 6 : -4)} 20`}
          fill="none"
          stroke="#2f7a45"
          strokeWidth="3"
        />
      ))}
      <Iris x={30 + shift} y={48} />
      <Iris x={72} y={36} />
      <Iris x={96} y={70} />
    </g>
  );
}

function Iris({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="-7" cy="6" rx="5" ry="14" fill="#4a45b0" stroke={INK} strokeWidth="0.7" transform="rotate(-18)" />
      <ellipse cx="7" cy="6" rx="5" ry="14" fill="#4a45b0" stroke={INK} strokeWidth="0.7" transform="rotate(18)" />
      <ellipse cy="10" rx="5" ry="16" fill="#2e348c" stroke={INK} strokeWidth="0.7" />
      <circle cy="4" r="3" fill={GOLD} />
    </g>
  );
}

function Peony() {
  return (
    <g>
      <circle cx="60" cy="108" r="46" fill="#e24b78" stroke={INK} strokeWidth="1.4" />
      <circle cx="60" cy="108" r="32" fill="#f28aab" stroke={INK} strokeWidth="1" />
      <circle cx="60" cy="108" r="16" fill="#fde4ee" stroke={INK} strokeWidth="1" />
      <circle cx="60" cy="108" r="6" fill="#f0c84a" stroke={INK} strokeWidth="0.8" />
      {[0, 45, 90, 135].map((angle) => (
        <ellipse
          key={angle}
          cx="60"
          cy="62"
          rx="12"
          ry="18"
          fill="#d43b6a"
          stroke={INK}
          strokeWidth="0.8"
          transform={`rotate(${angle} 60 108)`}
        />
      ))}
    </g>
  );
}

function Hagi({ shift = 0 }: { shift?: number }) {
  return (
    <g>
      <path d="M16 176 C28 110 24 60 40 16" fill="none" stroke="#3d6e32" strokeWidth="2.4" />
      <path d="M48 180 C62 100 50 50 78 12" fill="none" stroke="#3d6e32" strokeWidth="2.4" />
      <path d="M86 176 C90 110 110 70 100 20" fill="none" stroke="#3d6e32" strokeWidth="2.2" />
      {[
        [30, 40],
        [36, 72],
        [28, 108],
        [34, 142],
        [66, 36],
        [74, 70],
        [60, 108],
        [70, 146],
        [96, 54],
        [104, 96],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x! + (i % 2 ? shift : 0)} ${y})`}>
          <ellipse rx="9" ry="5" fill="#7eae68" stroke={INK} strokeWidth="0.5" />
          <circle cy="-7" r="4.2" fill={i % 2 ? "#f4c0d0" : "#fff"} stroke={INK} strokeWidth="0.5" />
        </g>
      ))}
    </g>
  );
}

function Susuki({ shift = 0 }: { shift?: number }) {
  const blades = [10, 24, 38, 52, 66, 80, 94, 108];
  return (
    <g>
      {blades.map((x, i) => (
        <path
          key={x}
          d={`M${x} 180 C${x + (i % 2 ? 8 : -6)} 100 ${x - 4} 50 ${x + (i % 2 ? -8 : 6) + shift} ${16 + (i % 3) * 10}`}
          fill="none"
          stroke={i % 2 ? "#c6a15b" : "#8d6a2e"}
          strokeWidth={i % 3 === 0 ? 2.4 : 1.6}
          strokeLinecap="round"
        />
      ))}
      {blades.filter((_, i) => i % 2 === 0).map((x) => (
        <ellipse key={`h${x}`} cx={x} cy={28 + (x % 5) * 4} rx="3.2" ry="7" fill="#e6d7a4" stroke="#8d6a2e" strokeWidth="0.6" />
      ))}
    </g>
  );
}

function Chrysanthemum({ cx = 62, cy = 78, r = 40 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <g>
      {Array.from({ length: 16 }).map((_, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy - r * 0.62}
          rx={r * 0.16}
          ry={r * 0.42}
          fill={i % 2 ? "#f0d36a" : "#e2b43a"}
          stroke={INK}
          strokeWidth="0.5"
          transform={`rotate(${i * 22.5} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.28} fill="#f8efc4" stroke={INK} strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={r * 0.1} fill="#a97820" />
    </g>
  );
}

function MapleLeaf({ x, y, s = 1, fill = "#d3261e" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -16 L5 -6 L16 -8 L8 0 L14 10 L3 5 L1 16 L-3 6 L-14 10 L-7 0 L-16 -6 L-5 -7 Z"
      fill={fill}
      stroke={INK}
      strokeWidth="0.8"
    />
  );
}

function MapleSpray({ shift = 0 }: { shift?: number }) {
  const leaves: Array<[number, number, number, string]> = [
    [30, 36, 1.3, "#c4282e"],
    [70, 28, 1.1, "#e04a32"],
    [100, 58, 1, "#a61e24"],
    [24, 86, 1.15, "#d13a28"],
    [64, 96, 1.35, "#e15a34"],
    [102, 112, 0.9, "#c4282e"],
    [36, 140, 1.2, "#a61e24"],
    [78, 150, 1.05, "#e04a32"],
  ];
  return (
    <g>
      <path d="M10 20 C40 60 70 40 110 150" fill="none" stroke="#6a3a28" strokeWidth="3" />
      {leaves.map(([x, y, s, fill], i) => (
        <MapleLeaf key={i} x={x + (i % 2 ? shift : 0)} y={y} s={s} fill={fill} />
      ))}
    </g>
  );
}

function Willow({ shift = 0 }: { shift?: number }) {
  const strands = [16, 32, 48, 64, 80, 96, 112];
  return (
    <g>
      <path d="M4 8 H116" stroke="#2f5a34" strokeWidth="5" />
      {strands.map((x, i) => (
        <path
          key={x}
          d={`M${x} 10 C${x + (i % 2 ? 16 : -14)} 70 ${x - 8} 120 ${x + (i % 2 ? -6 : 10) + shift} 176`}
          fill="none"
          stroke={i % 2 ? "#2f7a46" : "#1e5c34"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function Paulownia({ shift = 0 }: { shift?: number }) {
  return (
    <g>
      <path d="M60 176 V70" stroke="#5a4630" strokeWidth="3" />
      <path
        d={`M${28 + shift} 78 C20 50 40 36 60 48 C80 36 104 52 92 80 C80 70 40 70 ${28 + shift} 78 Z`}
        fill="#d7dc62"
        stroke={INK}
        strokeWidth="1.2"
      />
      <path
        d="M18 118 C8 96 34 86 52 100 C40 112 24 112 18 118 Z"
        fill="#c6d24e"
        stroke={INK}
        strokeWidth="1"
      />
      <path
        d="M70 124 C78 96 108 98 104 126 C92 118 78 122 70 124 Z"
        fill="#d7dc62"
        stroke={INK}
        strokeWidth="1"
      />
      {[
        [46, 40],
        [64, 32],
        [78, 48],
        [40, 58],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="8" fill={i % 2 ? "#7a4ea8" : "#9a72c4"} stroke={INK} strokeWidth="0.6" />
      ))}
    </g>
  );
}

function Kasu({ month, variant, bolt = false }: { month: number; variant: number; bolt?: boolean }) {
  const shift = variant === 2 ? 6 : variant === 3 ? -4 : 0;
  return (
    <g>
      <Sheet />
      {month === 1 ? <PineSpray shift={shift} /> : null}
      {month === 2 ? <PlumBranch shift={shift} /> : null}
      {month === 3 ? <CherryCloud shift={shift} /> : null}
      {month === 4 ? <Wisteria shift={shift} /> : null}
      {month === 5 ? <IrisBed shift={shift} /> : null}
      {month === 6 ? <Peony /> : null}
      {month === 7 ? <Hagi shift={shift} /> : null}
      {month === 8 ? <Susuki shift={shift} /> : null}
      {month === 9 ? <Chrysanthemum cx={60} cy={90} r={52} /> : null}
      {month === 10 ? <MapleSpray shift={shift} /> : null}
      {month === 11 ? (
        <>
          <Willow shift={shift} />
          {bolt ? (
            <>
              <path d="M78 20 L48 150" stroke={GOLD} strokeWidth="7" strokeLinecap="round" />
              <path d="M78 20 L96 48 L70 46 L92 78 L62 70 L84 108 L50 112 L70 150" fill="none" stroke="#f6e7a4" strokeWidth="3" />
            </>
          ) : null}
        </>
      ) : null}
      {month === 12 ? <Paulownia shift={shift} /> : null}
      <Rim />
    </g>
  );
}

function Ribbon({ blue, poetry }: { blue: boolean; poetry: boolean }) {
  const fill = blue ? "#2a3d86" : RED;
  return (
    <g>
      <rect x="80" y="14" width="26" height="152" rx="2" fill={fill} stroke={INK} strokeWidth="1.4" />
      <rect x="83" y="14" width="5" height="152" fill="#fff" opacity="0.18" />
      {(poetry || blue) &&
        [32, 46, 62, 78, 94, 110, 126, 142].map((y, i) => (
          <rect key={y} x={86 + (i % 2 ? 2 : 0)} y={y} width={i % 3 === 0 ? 14 : 10} height="3.2" fill={blue ? "#d5e2f6" : INK} />
        ))}
    </g>
  );
}

function Crane() {
  return (
    <g>
      <Sheet />
      <circle cx="34" cy="42" r="24" fill={RED} stroke={INK} strokeWidth="1.4" />
      <circle cx="34" cy="42" r="16" fill="#e23a32" />
      <PineSpray />
      <ellipse cx="62" cy="124" rx="26" ry="14" fill="#f7f3ea" stroke={INK} strokeWidth="1.6" />
      <path d="M40 120 C22 112 14 96 20 84" fill="none" stroke={INK} strokeWidth="2" />
      <path d="M48 130 C28 146 16 140 14 126" fill={INK} />
      <path d="M80 116 C100 104 108 82 100 58" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="100" cy="54" r="5" fill={INK} />
      <path d="M96 48 L106 40 L94 44 Z" fill={RED} stroke={INK} strokeWidth="0.6" />
      <path d="M96 56 L108 58" stroke="#f0d2a0" strokeWidth="1.4" />
      <Rim />
    </g>
  );
}

function Warbler() {
  return (
    <g>
      <Sheet />
      <PlumBranch />
      <g transform="translate(58 96)">
        <ellipse cx="0" cy="0" rx="16" ry="10" fill="#7f8c3e" stroke={INK} strokeWidth="1.3" />
        <ellipse cx="6" cy="2" rx="8" ry="6" fill="#e7efc4" />
        <circle cx="14" cy="-6" r="6" fill="#7f8c3e" stroke={INK} strokeWidth="1.1" />
        <circle cx="16" cy="-7" r="1.3" fill={INK} />
        <path d="M18 -4 L28 -8 L18 0 Z" fill="#e6b84a" stroke={INK} strokeWidth="0.6" />
        <path d="M-6 6 L-4 16" stroke="#5c4030" strokeWidth="1.4" />
      </g>
      <Rim />
    </g>
  );
}

function Curtain() {
  return (
    <g>
      <Sheet />
      <CherryCloud />
      <path d="M16 24 H104" stroke="#3a241c" strokeWidth="4" />
      <path
        d="M22 28 H98 V118 C98 118 86 108 76 120 C66 132 58 108 48 122 C38 136 30 110 22 124 Z"
        fill={RED}
        stroke={INK}
        strokeWidth="1.5"
      />
      <circle cx="60" cy="74" r="16" fill="none" stroke={GOLD} strokeWidth="3.5" />
      <circle cx="60" cy="74" r="6" fill={GOLD} stroke={INK} strokeWidth="0.8" />
      <Rim />
    </g>
  );
}

function Cuckoo() {
  return (
    <g>
      <Sheet />
      <Wisteria />
      <g transform="translate(62 108)">
        <ellipse cx="0" cy="0" rx="18" ry="8" fill="#5e6c76" stroke={INK} strokeWidth="1.2" />
        <path d="M-16 0 L-30 -8 L-12 4 Z" fill="#4a5862" stroke={INK} strokeWidth="0.7" />
        <circle cx="14" cy="-2" r="5.5" fill="#5e6c76" stroke={INK} strokeWidth="1" />
        <circle cx="16" cy="-3" r="1.2" fill={INK} />
        <path d="M18 -1 L26 1 L18 3 Z" fill={GOLD} />
      </g>
      <Rim />
    </g>
  );
}

function Bridge() {
  return (
    <g>
      <IrisBed />
      <rect y="128" width="120" height="52" fill="#6eafd2" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i} transform={`translate(${8 + i * 16} ${108 - (i % 2) * 14}) rotate(${i % 2 ? 18 : -16})`}>
          <rect width="22" height="8" rx="1" fill={i % 2 ? "#c9844c" : "#a86834"} stroke={INK} strokeWidth="0.8" />
        </g>
      ))}
      <Rim />
    </g>
  );
}

function Butterflies() {
  return (
    <g>
      <Sheet />
      <Peony />
      <g transform="translate(34 48)">
        <ellipse cx="-10" cy="0" rx="12" ry="8" fill={RED} stroke={INK} strokeWidth="1" />
        <ellipse cx="10" cy="0" rx="12" ry="8" fill={RED} stroke={INK} strokeWidth="1" />
        <ellipse cx="-8" cy="7" rx="7" ry="5" fill="#f4d0dc" stroke={INK} strokeWidth="0.6" />
        <ellipse cx="8" cy="7" rx="7" ry="5" fill="#f4d0dc" stroke={INK} strokeWidth="0.6" />
        <rect x="-1.2" y="-8" width="2.4" height="18" fill={INK} />
        <circle cy="-4" r="1.2" fill="#fff" />
      </g>
      <g transform="translate(86 36) scale(0.75)">
        <ellipse cx="-10" cy="0" rx="12" ry="8" fill="#f2f2ea" stroke={INK} strokeWidth="1" />
        <ellipse cx="10" cy="0" rx="12" ry="8" fill="#f2f2ea" stroke={INK} strokeWidth="1" />
        <rect x="-1.2" y="-8" width="2.4" height="16" fill={INK} />
      </g>
      <Rim />
    </g>
  );
}

function Boar() {
  return (
    <g>
      <Sheet />
      <Hagi />
      <g transform="translate(6 96)">
        <ellipse cx="52" cy="28" rx="40" ry="20" fill="#8a4a2c" stroke={INK} strokeWidth="1.5" />
        <path d="M28 16 L22 4 L36 14" fill="#6e381c" stroke={INK} strokeWidth="0.7" />
        <ellipse cx="86" cy="24" rx="16" ry="11" fill="#a15c38" stroke={INK} strokeWidth="1.3" />
        <circle cx="92" cy="20" r="1.5" fill={INK} />
        <path d="M98 24 L112 20 L100 30 Z" fill="#f6efe2" stroke={INK} strokeWidth="0.8" />
        <path d="M24 44 L20 62 M40 46 L40 64 M62 46 L66 64" stroke="#5c3018" strokeWidth="3.2" strokeLinecap="round" />
      </g>
      <Rim />
    </g>
  );
}

function Moon() {
  return (
    <g>
      <Sheet />
      <circle cx="52" cy="78" r="46" fill="#f3d35a" stroke="#c6a15b" strokeWidth="3" />
      <circle cx="44" cy="70" r="36" fill="#f8e48a" opacity="0.45" />
      <Susuki />
      <Rim />
    </g>
  );
}

function Geese() {
  return (
    <g>
      <Sheet />
      <Susuki />
      {[
        [18, 36, 1],
        [48, 58, 1.05],
        [78, 84, 0.95],
      ].map(([x, y, s], i) => (
        <path
          key={i}
          transform={`translate(${x} ${y}) scale(${s})`}
          d="M0 8 L26 0 L12 8 L28 6 L8 14 Z"
          fill="#4e5964"
          stroke={INK}
          strokeWidth="1"
        />
      ))}
      <Rim />
    </g>
  );
}

function Sake() {
  return (
    <g>
      <Sheet />
      <Chrysanthemum cx={60} cy={70} r={48} />
      <path d="M34 108 H86 L76 142 H44 Z" fill={RED} stroke={INK} strokeWidth="1.5" />
      <ellipse cx="60" cy="108" rx="26" ry="9" fill="#e4453c" stroke={INK} strokeWidth="1.3" />
      <ellipse cx="60" cy="108" rx="16" ry="4.5" fill="#f6e2b4" />
      <rect x="54" y="86" width="12" height="20" rx="1" fill="#f3e2a8" stroke={INK} strokeWidth="0.8" />
      <Rim />
    </g>
  );
}

function Deer() {
  return (
    <g>
      <Sheet />
      <MapleSpray />
      <g transform="translate(8 96)">
        <ellipse cx="46" cy="30" rx="32" ry="16" fill="#c4844a" stroke={INK} strokeWidth="1.4" />
        <ellipse cx="78" cy="18" rx="12" ry="8" fill="#d59a5c" stroke={INK} strokeWidth="1.2" />
        <circle cx="84" cy="16" r="1.4" fill={INK} />
        <path d="M70 10 C66 -6 78 -16 74 0" fill="none" stroke="#5c3818" strokeWidth="2" />
        <path d="M78 8 C86 -8 98 -4 88 6" fill="none" stroke="#5c3818" strokeWidth="2" />
        <path d="M22 42 L18 60 M38 44 L38 62 M56 44 L60 60" stroke="#5c3818" strokeWidth="3" strokeLinecap="round" />
      </g>
      <Rim />
    </g>
  );
}

function RainMan() {
  return (
    <g>
      <rect width="120" height="180" fill="#e7eef4" />
      <Willow />
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={i}
          x1={6 + i * 8}
          y1="0"
          x2={-2 + i * 8}
          y2="180"
          stroke="#9eb4c6"
          strokeWidth="1.3"
        />
      ))}
      <path d="M62 46 C62 46 108 50 104 78 C92 66 74 66 62 78 Z" fill={RED} stroke={INK} strokeWidth="1.3" />
      <path d="M84 74 V132" stroke="#5c4030" strokeWidth="2" />
      <ellipse cx="78" cy="112" rx="16" ry="24" fill="#243044" stroke={INK} strokeWidth="1.2" />
      <circle cx="78" cy="84" r="6.5" fill="#f0d2b4" stroke={INK} strokeWidth="1" />
      <ellipse cx="28" cy="156" rx="11" ry="7" fill="#3c8a48" stroke={INK} strokeWidth="1" />
      <circle cx="22" cy="150" r="3.4" fill="#3c8a48" stroke={INK} strokeWidth="0.7" />
      <circle cx="34" cy="150" r="3.4" fill="#3c8a48" stroke={INK} strokeWidth="0.7" />
      <circle cx="22" cy="150" r="1" fill={INK} />
      <circle cx="34" cy="150" r="1" fill={INK} />
      <Rim />
    </g>
  );
}

function Swallow() {
  return (
    <g>
      <Sheet />
      <Willow />
      <g transform="translate(64 90)">
        <ellipse cx="0" cy="4" rx="14" ry="7" fill="#243044" stroke={INK} strokeWidth="1" />
        <path d="M-8 8 L-18 22 L-2 10 Z" fill="#243044" stroke={INK} strokeWidth="0.7" />
        <path d="M-2 8 L6 24 L8 8 Z" fill="#243044" stroke={INK} strokeWidth="0.7" />
        <circle cx="12" cy="-2" r="5" fill="#243044" stroke={INK} strokeWidth="0.9" />
        <circle cx="14" cy="-3" r="1.1" fill="#fff" />
        <path d="M16 -1 L24 1 L16 3 Z" fill={GOLD} />
      </g>
      <Rim />
    </g>
  );
}

function Phoenix() {
  return (
    <g>
      <Sheet />
      <Paulownia />
      <path
        d="M18 132 C36 78 28 58 48 40 C38 62 58 66 62 88 C74 52 104 46 108 74 C96 64 80 78 78 100 C100 96 108 118 92 136 C70 116 36 124 18 132 Z"
        fill={GOLD}
        stroke={INK}
        strokeWidth="1.4"
      />
      <path d="M48 44 C54 30 70 28 72 42" fill="none" stroke={RED} strokeWidth="2.4" />
      <circle cx="66" cy="86" r="2.4" fill={INK} />
      <path d="M74 92 L102 84" stroke={RED} strokeWidth="2.2" />
      <path d="M30 120 C18 108 16 96 28 100" fill="#f6e7a8" stroke={INK} strokeWidth="0.8" />
      <Rim />
    </g>
  );
}

function Face({ card }: { card: Card }) {
  const variant = Number(card.id.at(-1)) || 1;
  let art: ReactNode;
  if (card.kind === "kasu") art = <Kasu month={card.month} variant={variant} bolt={card.month === 11} />;
  else if (card.kind === "tanzaku") {
    art = (
      <>
        <Kasu month={card.month} variant={1} />
        <Ribbon blue={card.tags.includes("blue")} poetry={card.tags.includes("poetry")} />
        <Rim />
      </>
    );
  } else {
    switch (card.id) {
      case "m1-crane":
        art = <Crane />;
        break;
      case "m2-warbler":
        art = <Warbler />;
        break;
      case "m3-curtain":
        art = <Curtain />;
        break;
      case "m4-cuckoo":
        art = <Cuckoo />;
        break;
      case "m5-bridge":
        art = <Bridge />;
        break;
      case "m6-butterflies":
        art = <Butterflies />;
        break;
      case "m7-boar":
        art = <Boar />;
        break;
      case "m8-moon":
        art = <Moon />;
        break;
      case "m8-geese":
        art = <Geese />;
        break;
      case "m9-sake":
        art = <Sake />;
        break;
      case "m10-deer":
        art = <Deer />;
        break;
      case "m11-rain":
        art = <RainMan />;
        break;
      case "m11-swallow":
        art = <Swallow />;
        break;
      default:
        art = <Phoenix />;
    }
  }
  return (
    <svg viewBox="0 0 120 180" className="block h-full w-full" aria-hidden="true">
      {art}
    </svg>
  );
}

function Back() {
  return (
    <svg viewBox="0 0 120 180" className="block h-full w-full" aria-hidden="true">
      <rect width="120" height="180" fill="#16130f" />
      <rect x="7" y="7" width="106" height="166" fill="none" stroke="#8c7340" strokeWidth="1.6" />
      <rect x="12" y="12" width="96" height="156" fill="none" stroke="#8c7340" strokeWidth="0.8" />
      <g transform="translate(60 90)" fill="none" stroke="#8c7340" strokeWidth="1.4">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <ellipse key={angle} cx="0" cy="-10" rx="5" ry="7" transform={`rotate(${angle})`} />
        ))}
        <circle r="3" fill="#8c7340" stroke="none" />
      </g>
    </svg>
  );
}

export function CardView({
  card,
  faceDown = false,
  hot = false,
  blink = false,
  dim = false,
  taken = false,
  mini = false,
  hero = false,
  stack = false,
  onClick,
  onHoverMonth,
  disabled = false,
}: {
  card?: Card;
  faceDown?: boolean;
  hot?: boolean;
  blink?: boolean;
  dim?: boolean;
  taken?: boolean;
  mini?: boolean;
  hero?: boolean;
  stack?: boolean;
  onClick?: () => void;
  onHoverMonth?: (month: number | null) => void;
  disabled?: boolean;
}) {
  const className = cx(
    "hana-card",
    mini && "is-mini",
    hero && "is-hero",
    stack && "is-backstack",
    blink && "is-blink",
    taken && "is-taken",
    dim && "is-dim",
  );
  const art = faceDown || !card ? <Back /> : <Face card={card} />;
  const month = card && !faceDown ? card.month : undefined;
  const point =
    onHoverMonth && card
      ? {
          onMouseEnter: () => onHoverMonth(card.month),
          onMouseLeave: () => onHoverMonth(null),
          onFocus: () => onHoverMonth(card.month),
          onBlur: () => onHoverMonth(null),
        }
      : {};
  if (!onClick) {
    return (
      <div className={className} data-month={month} aria-hidden={faceDown || undefined} {...point}>
        {art}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={className}
      data-month={month}
      onClick={onClick}
      disabled={disabled}
      aria-label={card ? `${card.name}${hot ? "、場と同じ月" : ""}` : "札"}
      {...point}
    >
      {art}
    </button>
  );
}
