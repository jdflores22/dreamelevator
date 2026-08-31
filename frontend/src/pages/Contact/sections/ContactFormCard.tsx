import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send } from 'lucide-react';
import { useSubmitContact } from '@/api/hooks';
import { CONTACT_SENDER_TYPES } from '@/constants/contactSenderTypes';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const senderTypeValues = CONTACT_SENDER_TYPES.map((item) => item.value) as [
  string,
  ...string[],
];

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  companyName: z.string().min(2, 'Building or company is required'),
  senderType: z.enum(senderTypeValues, { message: 'Please select who is sending this message' }),
  subject: z.string().min(3, 'Subject is required'),
  body: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

interface ContactFormCardProps {
  isDark?: boolean;
  formTitle?: string;
  formSubtitle?: string;
  recipientEmail?: string;
}

export function ContactFormCard({
  isDark = false,
  formTitle = 'Send us a message',
  formSubtitle = 'Fill out the form and our team will get back to you shortly.',
  recipientEmail,
}: ContactFormCardProps) {
  const mutation = useSubmitContact();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data, { onSuccess: () => reset() });
  };

  return (
    <div
      id="contact-form"
      className={cn(
        'rounded-sm border p-5 shadow-sm sm:p-8',
        isDark ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-white',
      )}
    >
      <h3 className={cn('text-xl font-semibold tracking-tight', isDark ? 'text-white' : 'text-primary-900')}>
        {formTitle}
      </h3>
      {formSubtitle && (
        <p className={cn('mt-2 text-sm leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-600')}>
          {formSubtitle}
        </p>
      )}
      {recipientEmail && (
        <p className={cn('mt-2 text-xs leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-500')}>
          Submissions are sent to{' '}
          <a
            href={`mailto:${recipientEmail}`}
            className={cn(
              'font-medium underline-offset-2 hover:underline',
              isDark ? 'text-brand-gold-400' : 'text-primary-700',
            )}
          >
            {recipientEmail}
          </a>
          .
        </p>
      )}

      {mutation.isSuccess && (
        <div
          className={cn(
            'mt-5 rounded-lg border p-4 text-sm',
            isDark
              ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
              : 'border-primary-100 bg-primary-50 text-primary-800',
          )}
        >
          Thank you! Your message has been sent successfully.
        </div>
      )}
      {mutation.isError && (
        <div className="mt-5 rounded-lg border border-brand-red-500/20 bg-brand-red-500/10 p-4 text-sm text-brand-red-700">
          Failed to send message. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <p
            className={cn(
              'mb-2 text-sm font-medium',
              isDark ? 'text-slate-200' : 'text-slate-700',
            )}
          >
            Who is sending this message?
          </p>
          <Controller
            name="senderType"
            control={control}
            render={({ field }) => (
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Sender type">
                {CONTACT_SENDER_TYPES.map((option) => {
                  const selected = field.value === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(option.value)}
                      className={cn(
                        'min-h-12 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-all',
                        selected
                          ? isDark
                            ? 'border-brand-gold-400/60 bg-brand-gold-400/10 text-brand-gold-300'
                            : 'border-brand-gold-500/50 bg-brand-gold-500/5 text-primary-900 shadow-sm'
                          : isDark
                            ? 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          />
          {errors.senderType?.message && (
            <p className="mt-1.5 text-xs text-brand-red-600">{errors.senderType.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <Input
          label="Building or company"
          error={errors.companyName?.message}
          {...register('companyName')}
        />
        <Input label="Subject" error={errors.subject?.message} {...register('subject')} />
        <Textarea label="Message" rows={5} error={errors.body?.message} {...register('body')} />
        <Button type="submit" className="w-full sm:w-auto" isLoading={mutation.isPending}>
          Send message
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
