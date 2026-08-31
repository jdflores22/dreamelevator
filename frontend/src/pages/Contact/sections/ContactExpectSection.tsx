import { MessageSquare, PhoneCall, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Container } from '@/components/common/Container';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useSectionContent, useSectionDarkBackground } from '@/hooks/useSectionContent';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { sectionSurfaceClass, sectionTheme } from '@/utils/sectionSurface';
import { deecCopy } from '@/utils/deecCopy';
import { cn } from '@/utils/cn';

const STEP_ICONS: LucideIcon[] = [MessageSquare, PhoneCall, Rocket];

interface StepProps {
  step: number;
  title: string;
  text: string;
  icon: LucideIcon;
  isDark: boolean;
}

function ExpectStep({ step, title, text, icon: Icon, isDark }: StepProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-sm border p-6 sm:p-7',
        isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white shadow-sm',
      )}
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-sm text-sm font-semibold',
            isDark ? 'bg-brand-gold-500/20 text-brand-gold-400' : 'bg-brand-gold-500/15 text-brand-gold-600',
          )}
        >
          {step}
        </span>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            isDark ? 'bg-primary-800/80' : 'bg-primary-50',
          )}
        >
          <Icon className={cn('h-5 w-5', isDark ? 'text-brand-gold-400' : 'text-primary-700')} strokeWidth={1.5} />
        </div>
      </div>
      <h3 className={cn('text-lg font-semibold tracking-tight', isDark ? 'text-white' : 'text-primary-900')}>
        {title}
      </h3>
      <p className={cn('mt-2 text-sm leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-600')}>{text}</p>
    </div>
  );
}

export function ContactExpectSection() {
  const isDark = useSectionDarkBackground('contact_expect', true);
  const theme = sectionTheme(isDark);
  const { get } = useSiteSettingsMap();
  const raw = useSectionContent('contact_expect');
  const section = {
    eyebrow: deecCopy(raw.eyebrow, 'What happens next'),
    title: deecCopy(raw.title, 'From first message to site assessment'),
    subtitle: deecCopy(
      raw.subtitle,
      'A straightforward path so you know what to expect after reaching out.',
    ),
  };

  const steps = [
    {
      title: deecCopy(get('contact_expect_step1_title'), 'Send your inquiry'),
      text: deecCopy(
        get('contact_expect_step1_text'),
        'Tell us the building, equipment brand or type, and whether you need supply, modernization, or service.',
      ),
    },
    {
      title: deecCopy(get('contact_expect_step2_title'), 'We review & respond'),
      text: deecCopy(
        get('contact_expect_step2_text'),
        'Our team replies within one business day and, when applicable, schedules a free Metro Manila assessment.',
      ),
    },
    {
      title: deecCopy(get('contact_expect_step3_title'), 'Survey & proposal'),
      text: deecCopy(
        get('contact_expect_step3_text'),
        'We confirm shaft and site conditions, then recommend equipment or a maintenance plan.',
      ),
    },
  ];

  return (
    <section className={sectionSurfaceClass(isDark)}>
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          title={section.title}
          subtitle={section.subtitle}
          theme={theme}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <ExpectStep
              key={step.title}
              step={index + 1}
              title={step.title}
              text={step.text}
              icon={STEP_ICONS[index] ?? MessageSquare}
              isDark={isDark}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
