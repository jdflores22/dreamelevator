import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ProcessStep } from '@/types';
import { cn } from '@/utils/cn';
import { ElevatorLanding, EscalatorMachine } from '@/components/marketing/LiftMachines';

const DWELL_MS = 4400;
const CLOSE_MS = 320;
const MOVE_MS = 860;
const OPEN_MS = 380;

type Phase = 'idle' | 'closing' | 'moving' | 'opening';

interface ProcessRoadmapProps {
  steps: ProcessStep[];
  className?: string;
  variant?: 'light' | 'dark';
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function ProcessRoadmap({
  steps,
  className,
  variant = 'light',
  eyebrow,
  title,
  subtitle,
}: ProcessRoadmapProps) {
  const isDark = variant === 'dark';
  const [active, setActive] = useState(0);
  const [cabFloor, setCabFloor] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const [paused, setPaused] = useState(false);
  const [queued, setQueued] = useState<number | null>(null);
  const [calledFloor, setCalledFloor] = useState<number | null>(null);
  const destRef = useRef<number | null>(null);
  const current = steps[active];
  const doorsShut = phase === 'closing' || phase === 'moving';
  const traveling = phase === 'moving';
  const displayFloor = phase === 'moving' ? cabFloor : active;

  const startTrip = useCallback(
    (next: number) => {
      destRef.current = next;
      setCalledFloor(next);
      setDirection(next >= active ? 'up' : 'down');
      setPhase('closing');
    },
    [active],
  );

  const requestFloor = useCallback(
    (next: number) => {
      if (next < 0 || next >= steps.length) return;
      if (prefersReducedMotion()) {
        destRef.current = null;
        setQueued(null);
        setCalledFloor(null);
        setDirection(next >= active ? 'up' : 'down');
        setActive(next);
        setCabFloor(next);
        setPhase('idle');
        return;
      }
      if (next === active && phase === 'idle') return;
      if (phase !== 'idle') {
        setQueued(next);
        return;
      }
      startTrip(next);
    },
    [active, phase, startTrip, steps.length],
  );

  useEffect(() => {
    if (phase === 'idle') return undefined;
    const wait = phase === 'closing' ? CLOSE_MS : phase === 'moving' ? MOVE_MS : OPEN_MS;
    const id = window.setTimeout(() => {
      if (phase === 'closing') {
        setCabFloor(destRef.current ?? active);
        setPhase('moving');
      } else if (phase === 'moving') {
        setActive(destRef.current ?? active);
        setPhase('opening');
      } else {
        destRef.current = null;
        setCalledFloor(null);
        setPhase('idle');
      }
    }, wait);
    return () => window.clearTimeout(id);
  }, [phase, active]);

  useEffect(() => {
    if (phase !== 'idle' || queued === null) return;
    const next = queued;
    setQueued(null);
    if (next === active) return;
    startTrip(next);
  }, [phase, queued, active, startTrip]);

  useEffect(() => {
    if (paused || steps.length < 2 || phase !== 'idle' || queued !== null) return;
    const id = window.setInterval(() => {
      requestFloor((active + 1) % steps.length);
    }, DWELL_MS);
    return () => window.clearInterval(id);
  }, [paused, steps.length, phase, active, queued, requestFloor]);

  if (steps.length === 0 || !current) return null;

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      requestFloor(Math.min(active + 1, steps.length - 1));
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      requestFloor(Math.max(active - 1, 0));
    }
  };

  return (
    <div
      className={cn('w-full', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {title ? (
        <div className="mb-6">
          {eyebrow ? <p className={isDark ? 'pro-eyebrow-dark mb-3' : 'pro-eyebrow mb-3'}>{eyebrow}</p> : null}
          <h2 className={cn('text-3xl font-semibold tracking-tight text-pretty sm:text-4xl', isDark ? 'text-white' : 'text-primary-900')}>
            {title}
          </h2>
          {subtitle ? (
            <p className={cn('mt-3 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg', isDark ? 'text-slate-300' : 'text-slate-600')}>
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mb-8 border-l-[3px] border-brand-gold-500 pl-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-live="polite"
          >
            <p className={isDark ? 'pro-eyebrow-dark mb-1.5' : 'pro-eyebrow mb-1.5'}>
              Landing {String(active + 1).padStart(2, '0')}
            </p>
            <h3
              className={cn(
                'text-xl font-semibold tracking-tight text-pretty sm:text-2xl',
                isDark ? 'text-white' : 'text-primary-900',
              )}
            >
              {current.title}
            </h3>
            <p
              className={cn(
                'mt-2 text-sm leading-relaxed text-pretty sm:text-base',
                isDark ? 'text-slate-300' : 'text-slate-600',
              )}
            >
              {current.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="grid items-stretch gap-4 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:gap-4"
        tabIndex={0}
        onKeyDown={onPanelKeyDown}
      >
        <ElevatorLanding
          steps={steps}
          active={active}
          cabFloor={cabFloor}
          displayFloor={displayFloor}
          phase={phase}
          direction={direction}
          doorsShut={doorsShut}
          traveling={traveling}
          queued={queued}
          calledFloor={calledFloor}
          doorMs={CLOSE_MS}
          isDark={isDark}
          onSelect={requestFloor}
        />
        <EscalatorMachine
          steps={steps}
          active={active}
          cabFloor={cabFloor}
          traveling={traveling}
          direction={direction}
          moveMs={MOVE_MS}
          isDark={isDark}
          onSelect={requestFloor}
        />
      </div>

      <ol className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const selected = index === active;
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => requestFloor(index)}
                className={cn(
                  'flex w-full items-start gap-3 border-l-[3px] px-3 py-2.5 text-left transition-colors',
                  selected
                    ? isDark
                      ? 'border-brand-gold-400 bg-white/10'
                      : 'border-brand-gold-500 bg-white shadow-sm'
                    : isDark
                      ? 'border-white/15 bg-white/[0.03] hover:border-white/30'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white',
                )}
              >
                <span
                  className={cn(
                    'font-display mt-0.5 text-sm font-semibold tabular-nums',
                    selected ? 'text-brand-gold-500' : isDark ? 'text-slate-500' : 'text-slate-400',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={cn('text-sm font-semibold leading-snug text-pretty', isDark ? 'text-white' : 'text-primary-900')}>
                  {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
