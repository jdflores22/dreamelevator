import { useState } from 'react';
import { Send } from 'lucide-react';
import { useSubscribe } from '@/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  className?: string;
  variant?: 'light' | 'dark';
  layout?: 'stack' | 'row';
}

export function NewsletterSignup({
  title = 'Project updates',
  description = 'Occasional news on installations, service, and company announcements.',
  className,
  variant = 'dark',
  layout = 'stack',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const subscribe = useSubscribe();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate(
      { email: email.trim() },
      {
        onSuccess: () => {
          setDone(true);
          setEmail('');
        },
      },
    );
  };

  const isDark = variant === 'dark';
  const isRow = layout === 'row';

  return (
    <div className={cn(isRow && 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className={cn(isRow && 'min-w-0 max-w-md')}>
        {title ? (
          <h3
            className={cn(
              'font-display text-[13px] font-semibold uppercase tracking-[0.16em]',
              isDark ? 'text-white' : 'text-primary-900',
            )}
          >
            {title}
          </h3>
        ) : null}
        {description ? (
          <p className={cn('mt-1 text-xs leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {description}
          </p>
        ) : null}
      </div>
      {done ? (
        <p className={cn('text-sm font-medium', isDark ? 'text-brand-gold-400' : 'text-primary-700')}>
          Thanks for subscribing!
        </p>
      ) : (
        <form onSubmit={onSubmit} className={cn('flex gap-2', isRow ? 'w-full max-w-md shrink-0' : 'mt-4')}>
          <Input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn('flex-1', isDark && 'border-white/15 bg-white/10 text-white placeholder:text-slate-500')}
          />
          <Button type="submit" size="sm" isLoading={subscribe.isPending} className="shrink-0">
            <Send className="h-4 w-4" />
            <span className="sr-only">Subscribe</span>
          </Button>
        </form>
      )}
    </div>
  );
}
