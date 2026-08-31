import { motion } from 'framer-motion';
import type { ProcessStep } from '@/types';
import { cn } from '@/utils/cn';

export function Passenger({
  pose = 'stand',
  className,
  width = 44,
  height = 72,
}: {
  pose?: 'stand' | 'ride';
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 44 76"
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      aria-hidden
    >
      <ellipse cx="22" cy="74" rx="12" ry="2" fill="#0A3144" opacity="0.18" />
      <path d="M15.6 71h5.4l.7 2.4H15Z" fill="#1c1917" />
      <path d="M23.2 71h5.4l.5 2.4h-6.5Z" fill="#1c1917" />
      <path d="M16 42.5 15.2 71h5.8l1.4-28.5Z" fill="#0A3144" />
      <path d="M22.8 42.5 24.2 71h5.6L28.2 42.5Z" fill="#0A3144" />
      <path d="M13.2 19c0-1.1 1-2 2.3-2h13c1.2 0 2.3.9 2.3 2V43H13.2V19Z" fill="#12394c" />
      <path d="M17 19h10v24H17Z" fill="#0A3144" opacity="0.35" />
      {pose === 'ride' ? (
        <>
          <path d="M15.6 22.5 5 8" stroke="#c4a574" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M28.6 24 34.5 42" stroke="#c4a574" strokeWidth="3.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M15.6 23.5 10.5 43" stroke="#c4a574" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M28.6 23.5 33.5 43" stroke="#c4a574" strokeWidth="3.4" strokeLinecap="round" />
        </>
      )}
      <circle cx="22" cy="11.2" r="5.4" fill="#d8b089" />
      <path d="M17 10.4c.5-3.2 2.6-5.2 5-5.2 2.3 0 4.4 1.9 4.9 5" fill="#2a1f14" />
      <path d="M14.8 8.6c1.2-4.6 5.2-7.2 9.2-6.6 3.6.6 6.2 3.6 6.4 7.2-2 .7-4.8 1.1-9 1.1-3 0-5.5-.5-6.6-1.7Z" fill="#F7971F" />
      <path d="M15.2 8h16.4" stroke="#e88912" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HallLantern({
  direction,
  lit,
  pulsing,
}: {
  direction: 'up' | 'down';
  lit: boolean;
  pulsing: boolean;
}) {
  return (
    <motion.span
      className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 ring-1 ring-white/15"
      animate={pulsing ? { opacity: [1, 0.28, 1] } : { opacity: 1 }}
      transition={pulsing ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
        <polygon
          points={direction === 'up' ? '12,4 20,19 4,19' : '12,20 20,5 4,5'}
          className={lit ? 'fill-brand-gold-400' : 'fill-zinc-600'}
        />
      </svg>
    </motion.span>
  );
}

const steelDoor =
  'linear-gradient(90deg, #8b949c 0%, #d7dee4 12%, #9aa3ab 28%, #eef2f5 46%, #b7c0c8 62%, #f6f8fa 78%, #8f99a2 100%)';

export function ElevatorLanding({
  steps,
  active,
  displayFloor,
  phase,
  direction,
  doorsShut,
  traveling,
  queued,
  calledFloor,
  doorMs,
  isDark = false,
  onSelect,
}: {
  steps: ProcessStep[];
  active: number;
  cabFloor: number;
  displayFloor: number;
  phase: string;
  direction: 'up' | 'down';
  doorsShut: boolean;
  traveling: boolean;
  queued: number | null;
  calledFloor: number | null;
  doorMs: number;
  isDark?: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[18rem] flex-col overflow-hidden border shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] sm:min-h-[22rem]',
        isDark ? 'border-white/10 bg-[#2c3338]' : 'border-slate-300 bg-[#3d444b]',
      )}
    >
      <div className="flex h-7 shrink-0 items-center justify-between gap-3 overflow-hidden px-3">
        <p className="min-w-0 truncate font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Passenger elevator
        </p>
        <p className="shrink-0 whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-gold-400">
          {phase === 'closing' && 'Doors closing'}
          {phase === 'moving' && (direction === 'up' ? 'Traveling up' : 'Traveling down')}
          {phase === 'opening' && 'Doors opening'}
          {phase === 'idle' && 'Arrived'}
        </p>
      </div>

      <div className="relative mx-2 mb-2 flex min-h-0 flex-1 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.04) 0 12px, transparent 12px), linear-gradient(#4a5258, #353b40)',
          }}
          aria-hidden
        />

        <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
          <div
            className="flex h-11 items-center justify-center gap-3 border-x border-t border-black/30 px-2"
            style={{
              backgroundImage: 'linear-gradient(180deg, #eceff2 0%, #b8c0c7 48%, #8e98a1 100%)',
            }}
          >
            <HallLantern direction="up" lit={direction === 'up' && phase !== 'idle'} pulsing={direction === 'up' && traveling} />
            <span
              className="font-display min-w-[2.75rem] rounded-[2px] bg-black px-2 py-0.5 text-center text-[1.35rem] font-semibold tabular-nums leading-none text-brand-gold-400 ring-1 ring-white/10"
              style={{ textShadow: '0 0 12px rgba(247,151,31,0.7)' }}
            >
              {String(displayFloor + 1).padStart(2, '0')}
            </span>
            <HallLantern direction="down" lit={direction === 'down' && phase !== 'idle'} pulsing={direction === 'down' && traveling} />
          </div>

          <div className="relative min-h-0 flex-1 border-x border-black/35 bg-[#15191d]">
            <div className="absolute inset-[10px] overflow-hidden bg-[#2a3138]">
              <span className="absolute inset-x-0 top-0 z-[1] flex h-5 justify-center gap-5 bg-gradient-to-b from-zinc-700 to-zinc-900 pt-1">
                <span className="h-2 w-2 rounded-full bg-amber-100 shadow-[0_0_10px_rgba(254,243,199,0.9)]" />
                <span className="h-2 w-2 rounded-full bg-amber-100 shadow-[0_0_10px_rgba(254,243,199,0.9)]" />
                <span className="h-2 w-2 rounded-full bg-amber-100 shadow-[0_0_10px_rgba(254,243,199,0.9)]" />
              </span>
              <span
                className="absolute inset-x-3 top-6 bottom-8"
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #6b7580 0%, #9aa4ae 18%, #7b868f 50%, #c5ced6 78%, #5f6972 100%)',
                }}
              />
              <span className="absolute bottom-8 left-4 right-4 h-[3px] rounded-full bg-zinc-300/80" />
              <span
                className="absolute inset-x-0 bottom-0 h-8"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(90deg, #1f2933 0 6px, #111827 6px 7px), linear-gradient(#2a323a, #111827)',
                }}
              />
              <div className="absolute inset-x-0 bottom-8 top-8 z-[2] flex items-end justify-center">
                <Passenger pose="stand" className="h-[88%] max-h-[8.5rem] w-auto drop-shadow-md" />
              </div>
            </div>

            <motion.div
              className="absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden border-r border-black/40"
              style={{ backgroundImage: steelDoor }}
              animate={{ x: doorsShut ? '0%' : '-97%' }}
              transition={{ duration: doorMs / 1000, ease: [0.4, 0, 0.2, 1] }}
            >
              <span className="absolute inset-y-0 right-0 w-2 bg-black/15" />
              <span className="absolute inset-y-5 right-3 w-px bg-white/35" />
              <span className="absolute inset-y-8 left-2.5 w-[3px] rounded-full bg-zinc-700/50" />
            </motion.div>
            <motion.div
              className="absolute inset-y-0 right-0 z-20 w-1/2 overflow-hidden border-l border-black/40"
              style={{ backgroundImage: steelDoor }}
              animate={{ x: doorsShut ? '0%' : '97%' }}
              transition={{ duration: doorMs / 1000, ease: [0.4, 0, 0.2, 1] }}
            >
              <span className="absolute inset-y-0 left-0 w-2 bg-black/15" />
              <span className="absolute inset-y-5 left-3 w-px bg-white/35" />
            </motion.div>

            <span className="absolute inset-x-0 bottom-0 z-30 h-2 bg-gradient-to-r from-zinc-600 via-zinc-200 to-zinc-600 shadow-[0_-2px_6px_rgba(0,0,0,0.35)]" />
          </div>
        </div>

        <div
          className="relative z-[1] flex w-[3.6rem] shrink-0 flex-col items-center gap-1.5 border border-black/30 py-2"
          style={{ backgroundImage: 'linear-gradient(180deg, #d5dce2, #8e98a1)' }}
        >
          {steps.map((step, index) => {
            const selected = index === active && phase === 'idle';
            const called = calledFloor === index && phase !== 'idle';
            const lit = selected || called || queued === index;
            return (
              <button
                key={step.id}
                type="button"
                aria-label={`Floor ${index + 1}: ${step.title}`}
                onClick={() => onSelect(index)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-gold-500"
              >
                <span
                  className={cn(
                    'absolute inset-0 rounded-full',
                    lit
                      ? 'bg-brand-gold-400/20 shadow-[0_0_10px_rgba(247,151,31,0.75)] ring-2 ring-brand-gold-400'
                      : 'ring-1 ring-black/35',
                  )}
                />
                <span
                  className={cn(
                    'relative flex h-[1.4rem] w-[1.4rem] items-center justify-center rounded-full font-display text-[9px] font-semibold tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]',
                    lit ? 'bg-brand-gold-500 text-primary-950' : 'bg-[#1a2229] text-white',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EscalatorTread({
  x,
  y,
  treadW,
  riserH,
}: {
  x: number;
  y: number;
  treadW: number;
  riserH: number;
}) {
  return (
    <g>
      <rect x={x} y={y} width={treadW} height={riserH} fill="url(#deec-riser)" />
      <rect x={x} y={y - 12} width={treadW} height="12" fill="url(#deec-tread)" />
      <rect x={x} y={y - 12} width={treadW} height="12" fill="url(#deec-grooves)" opacity="0.55" />
      <rect x={x} y={y - 3} width={treadW} height="3.5" fill="#F7971F" />
    </g>
  );
}

function EscalatorNewel({
  cx,
  cy,
  spinning,
  clockwise,
}: {
  cx: number;
  cy: number;
  spinning: boolean;
  clockwise: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r="17" fill="#0a0a0a" />
      <motion.g
        animate={spinning ? { rotate: clockwise ? [0, 360] : [0, -360] } : { rotate: 0 }}
        transition={spinning ? { duration: 1.05, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
      >
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#3f3f46" strokeWidth="2.4" />
        <line x1="0" y1="-10" x2="0" y2="10" stroke="#3f3f46" strokeWidth="2.4" />
        <circle r="9" fill="#2a2a2a" />
        <circle r="3.2" fill="#111" />
      </motion.g>
    </g>
  );
}

export function EscalatorMachine({
  steps,
  active,
  cabFloor,
  traveling,
  direction,
  moveMs,
  isDark = false,
  onSelect,
}: {
  steps: ProcessStep[];
  active: number;
  cabFloor: number;
  traveling: boolean;
  direction: 'up' | 'down';
  moveMs: number;
  isDark?: boolean;
  onSelect: (index: number) => void;
}) {
  const n = Math.max(steps.length, 1);
  const treadW = 78;
  const riserH = 26;
  const startX = 92;
  const startY = 236;
  const positions = steps.map((_, i) => ({
    x: startX + i * treadW,
    y: startY - i * riserH,
  }));
  const last = positions[n - 1] ?? positions[0];
  const goingUp = direction === 'up';
  const trip = traveling ? cabFloor - active : 0;
  const belt = { x: trip * treadW, y: trip * -riserH };
  const beltMove = { duration: traveling ? moveMs / 1000 : 0, ease: [0.4, 0, 0.2, 1] as const };
  const stand = positions[traveling ? active : cabFloor] ?? positions[0];
  const railPath = `M${startX - 8} ${startY - 78} L${last.x + treadW + 52} ${last.y - 78}`;
  const innerRail = `M${startX - 4} ${startY - 62} L${last.x + treadW + 46} ${last.y - 62}`;
  const beltSteps = Array.from({ length: n * 3 + 1 }, (_, i) => i - n);
  const walk0 = startY - 12;
  const walk1 = last.y - 12;
  const runEnd = last.x + treadW;

  return (
    <div
      className={cn(
        'flex h-full min-h-[16rem] flex-col border sm:min-h-[22rem]',
        isDark ? 'border-white/10 bg-[#1a242c]' : 'border-slate-200 bg-[#dce6eb]',
      )}
    >
      <div className="flex h-7 shrink-0 items-center justify-between gap-3 overflow-hidden px-3">
        <p className="min-w-0 truncate font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Passenger escalator
        </p>
        <p
          className={cn(
            'shrink-0 whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[0.12em]',
            traveling ? 'text-brand-gold-600' : 'text-slate-500',
          )}
        >
          {traveling ? (goingUp ? 'Ascending' : 'Descending') : `Landing ${String(cabFloor + 1).padStart(2, '0')}`}
        </p>
      </div>

      <svg viewBox="0 -18 820 318" className="h-full w-full min-h-[14rem] flex-1 overflow-visible sm:min-h-[18.5rem]" role="img" aria-label="Escalator process">
        <defs>
          <linearGradient id="deec-glass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e7f6fb" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#8fb9c8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id="deec-steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8edf1" />
            <stop offset="45%" stopColor="#a7b1ba" />
            <stop offset="100%" stopColor="#6d7780" />
          </linearGradient>
          <linearGradient id="deec-tread" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eceff2" />
            <stop offset="100%" stopColor="#9aa4ae" />
          </linearGradient>
          <linearGradient id="deec-riser" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b7580" />
            <stop offset="100%" stopColor="#3f474e" />
          </linearGradient>
          <linearGradient id="deec-rail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a0a0a" />
            <stop offset="45%" stopColor="#2b2b2b" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <pattern id="deec-grooves" width="6" height="10" patternUnits="userSpaceOnUse">
            <rect width="6" height="10" fill="#c9d2da" />
            <rect x="0" width="2.2" height="10" fill="#8f99a3" />
          </pattern>
          <clipPath id="deec-esc-belt">
            <polygon
              points={`${startX - 2},${startY + riserH + 4} ${runEnd + 2},${last.y + riserH + 4} ${runEnd + 2},${walk1 - 2} ${startX - 2},${walk0 - 2}`}
            />
          </clipPath>
        </defs>

        <rect x="0" y="250" width="820" height="50" fill={isDark ? '#243038' : '#c5d0d6'} />
        <rect x="0" y="250" width="820" height="4" fill="#9aa5ae" />

        <polygon
          points={`${startX - 24},${startY + riserH + 18} ${runEnd + 18},${last.y + riserH + 18} ${runEnd + 88},${last.y + 8} ${runEnd + 88},${last.y + 28} ${startX - 24},${startY + riserH + 38}`}
          fill="#3b444c"
        />

        <polygon
          points={`${startX - 14},${walk0 + 2} ${runEnd + 24},${walk1 + 2} ${runEnd + 72},${walk1 - 84} ${startX + 34},${walk0 - 84}`}
          fill="url(#deec-glass)"
          stroke="#b7c9d2"
          strokeWidth="1.4"
        />
        <polygon
          points={`${startX - 14},${walk0 + 2} ${runEnd + 24},${walk1 + 2} ${runEnd + 36},${walk1 - 10} ${startX - 2},${walk0 - 10}`}
          fill="url(#deec-steel)"
        />

        <g clipPath="url(#deec-esc-belt)">
          <motion.g initial={false} animate={belt} transition={beltMove}>
            {beltSteps.map((i) => (
              <EscalatorTread
                key={`belt-${i}`}
                x={startX + i * treadW}
                y={startY - i * riserH}
                treadW={treadW}
                riserH={riserH}
              />
            ))}
          </motion.g>
        </g>

        {positions.map((p, index) => {
          const selected = index === cabFloor;
          return (
            <g key={steps[index]?.id ?? index}>
              <text
                x={p.x + treadW / 2}
                y={p.y + 17}
                textAnchor="middle"
                fill={selected ? '#F7971F' : '#d1d5db'}
                fontSize="9"
                fontFamily="ui-sans-serif, system-ui"
                fontWeight="700"
                className="pointer-events-none"
              >
                {String(index + 1).padStart(2, '0')}
              </text>
              <rect
                x={p.x}
                y={p.y - 16}
                width={treadW}
                height={riserH + 18}
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onSelect(index)}
              >
                <title>{steps[index]?.title}</title>
              </rect>
            </g>
          );
        })}

        <rect x={startX - 88} y={walk0} width="88" height="12" fill="url(#deec-tread)" />
        <rect x={startX - 88} y={walk0} width="88" height="12" fill="url(#deec-grooves)" opacity="0.45" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`comb-l-${i}`} x={startX - 22 + i * 4.6} y={walk0} width="2.8" height="14" fill="#F7971F" />
        ))}
        <rect x={startX - 92} y={walk0 + 12} width="96" height="10" fill="url(#deec-steel)" />

        <rect x={runEnd} y={walk1} width="96" height="12" fill="url(#deec-tread)" />
        <rect x={runEnd} y={walk1} width="96" height="12" fill="url(#deec-grooves)" opacity="0.45" />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={`comb-r-${i}`} x={runEnd + i * 4.6} y={walk1} width="2.8" height="14" fill="#F7971F" />
        ))}
        <rect x={runEnd - 4} y={walk1 + 12} width="104" height="10" fill="url(#deec-steel)" />

        <motion.g initial={false} animate={belt} transition={beltMove}>
          <g transform={`translate(${stand.x + 8} ${stand.y - 110})`}>
            <Passenger pose="ride" width={64} height={98} />
          </g>
        </motion.g>

        <path d={railPath} fill="none" stroke="url(#deec-rail)" strokeWidth="13" strokeLinecap="round" />
        <motion.path
          d={railPath}
          fill="none"
          stroke="#3f3f46"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="16 14"
          animate={traveling ? { strokeDashoffset: goingUp ? [0, -30] : [0, 30] } : { strokeDashoffset: 0 }}
          transition={traveling ? { duration: 0.42, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}
        />
        <path d={innerRail} fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" opacity="0.55" />

        <EscalatorNewel cx={startX - 8} cy={startY - 70} spinning={traveling} clockwise={goingUp} />
        <EscalatorNewel cx={last.x + treadW + 52} cy={last.y - 70} spinning={traveling} clockwise={goingUp} />
      </svg>
    </div>
  );
}
