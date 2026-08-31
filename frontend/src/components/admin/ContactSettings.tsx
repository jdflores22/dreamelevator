import { useState } from 'react';
import { AlertCircle, CheckCircle2, Globe, Mail, MapPin, Phone, Send, Smartphone } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useEmailStatus,
  useSendTestEmail,
  useSiteSettings,
  useUpdateSiteSetting,
  useCreateSiteSetting,
} from '@/api/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { SaveFeedback, SettingsPanel } from '@/components/admin/SettingsPanel';
import { normalizeGoogleMapEmbedInput } from '@/utils/media';
import { toast } from '@/store/toastStore';
import { isAxiosError } from 'axios';

const CONTACT_FIELDS = [
  { key: 'company_email', label: 'Email', icon: Mail, placeholder: 'hello@example.com' },
  { key: 'company_email_alt', label: 'Alternate email', icon: Mail, placeholder: 'second@example.com' },
  { key: 'company_phone', label: 'Trunkline', icon: Phone, placeholder: '+63 2 0000 0000' },
  {
    key: 'company_mobiles',
    label: 'Mobile numbers',
    icon: Smartphone,
    placeholder: 'One number per line',
    type: 'textarea' as const,
    rows: 3,
  },
  { key: 'company_website', label: 'Website', icon: Globe, placeholder: 'www.example.com' },
  { key: 'company_address', label: 'Address', icon: MapPin, placeholder: 'Global Headquarters' },
] as const;

const SMTP_FIELDS = [
  { key: 'smtp_host', label: 'SMTP server', placeholder: 'smtp.hostinger.com' },
  { key: 'smtp_port', label: 'SMTP port', placeholder: '465', inputMode: 'numeric' as const },
  {
    key: 'smtp_username',
    label: 'SMTP login email',
    placeholder: 'Leave blank to use contact email above',
  },
  {
    key: 'smtp_password',
    label: 'SMTP password',
    placeholder: 'Mailbox password (leave blank to keep current)',
    type: 'password' as const,
  },
] as const;

const EMAIL_DELIVERY_KEYS = ['email_provider', 'hostinger_mail_api_token', ...SMTP_FIELDS.map((f) => f.key)] as const;

function isEmailSettingKey(key: string) {
  return key === 'email_provider' || key.startsWith('smtp_') || key.startsWith('hostinger_');
}

function isSecretEmailValue(key: string, value: string) {
  return (key === 'smtp_password' || key === 'hostinger_mail_api_token') && (value === '********' || !value.trim());
}

const OFFICE_HOURS_FIELDS = [
  { key: 'contact_office_hours_title', label: 'Office hours title', default: 'Office hours' },
  {
    key: 'contact_office_hours',
    label: 'Schedule (one line per row: Day range|Hours)',
    default: 'Mon–Fri|9:00 AM – 6:00 PM (PHT)\nSat–Sun|Closed',
    type: 'textarea' as const,
  },
  {
    key: 'contact_office_hours_note',
    label: 'Footnote',
    default: 'Times shown in Philippines Standard Time (PHT).',
  },
] as const;

const MAP_FIELD = {
  key: 'contact_map_embed_url',
  label: 'Google Maps embed URL',
  placeholder: 'https://www.google.com/maps/embed?pb=...',
  hint: 'Optional. Leave blank to auto-embed from your address. Or paste Google Maps → Share → Embed a map iframe src.',
} as const;

const ALL_SETTING_KEYS = [
  ...CONTACT_FIELDS.map((f) => f.key),
  ...EMAIL_DELIVERY_KEYS,
  ...OFFICE_HOURS_FIELDS.map((f) => f.key),
  MAP_FIELD.key,
] as const;

export function ContactSettings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useSiteSettings();
  const { data: emailStatus, isLoading: emailStatusLoading } = useEmailStatus();
  const testEmailMutation = useSendTestEmail();
  const updateMutation = useUpdateSiteSetting();
  const createMutation = useCreateSiteSetting();
  const [saved, setSaved] = useState(false);

  const values = Object.fromEntries(
    ALL_SETTING_KEYS.map((key) => [key, settings?.find((s) => s.key === key)?.value ?? '']),
  );

  const saveField = async (key: string, value: string) => {
    if (isSecretEmailValue(key, value)) {
      return;
    }

    const normalizedValue =
      key === MAP_FIELD.key ? normalizeGoogleMapEmbedInput(value) : value;
    const group = isEmailSettingKey(key) ? 'email' : 'contact';
    const isPublic = !isEmailSettingKey(key);
    const existing = settings?.find((s) => s.key === key);

    if (existing) {
      await updateMutation.mutateAsync({
        id: existing.id,
        data: { value: normalizedValue, group, isPublic },
      });
    } else if (normalizedValue.trim() || key === 'smtp_username' || key === 'email_provider') {
      await createMutation.mutateAsync({
        key,
        value: normalizedValue,
        group,
        isPublic,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    await Promise.all(
      ALL_SETTING_KEYS.map((key) => saveField(key, String(formData.get(key) ?? ''))),
    );
    await queryClient.invalidateQueries({ queryKey: ['email', 'status'] });
    setSaved(true);
  };

  const handleSendTestEmail = async () => {
    try {
      const result = await testEmailMutation.mutateAsync(undefined);
      if (result.success) {
        toast.success('Test email sent', result.message);
        return;
      }

      const isNotConfigured = result.outcome === 'SkippedNotConfigured';
      if (isNotConfigured) {
        toast.warning('SMTP not configured', result.message);
      } else {
        toast.error('Test email failed', result.message);
      }
    } catch (error) {
      const apiMessage = isAxiosError(error)
        ? error.response?.data?.errors?.[0] ??
          error.response?.data?.data?.message ??
          error.message
        : error instanceof Error
          ? error.message
          : 'Test email failed';
      toast.error('Test email failed', apiMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const emailProvider = values.email_provider || 'hostinger_api';
  const usesHostingerApi = emailProvider === 'hostinger_api';

  return (
    <SettingsPanel
      icon={Phone}
      title="Contact information"
      description="Contact details shown on the site. Form notifications go to the contact email; SMTP settings below control outbound delivery."
      footer={
        <>
          <Button type="submit" form="contact-settings-form" isLoading={isSaving}>
            Save contact & email settings
          </Button>
          <SaveFeedback saved={saved} isSaving={isSaving} />
        </>
      }
    >
      <form id="contact-settings-form" onSubmit={(e) => void handleSubmit(e)}>
        <div className="grid gap-5 sm:grid-cols-2">
          {CONTACT_FIELDS.map((field) => (
            <div
              key={field.key}
              className={
                field.key === 'company_address' || field.key === 'company_mobiles'
                  ? 'sm:col-span-2'
                  : undefined
              }
            >
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                <field.icon className="h-4 w-4 text-brand-gold-500" />
                {field.label}
              </label>
              {'type' in field && field.type === 'textarea' ? (
                <Textarea
                  name={field.key}
                  defaultValue={values[field.key]}
                  placeholder={field.placeholder}
                  rows={field.rows}
                />
              ) : (
                <Input name={field.key} defaultValue={values[field.key]} placeholder={field.placeholder} />
              )}
              {field.key === 'company_email' && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Contact form notifications are sent here. If SMTP login is blank, this address is also used to send mail.
                </p>
              )}
              {field.key === 'company_mobiles' && (
                <p className="mt-1.5 text-xs text-slate-500">One mobile number per line. Shown on the contact page and footer.</p>
              )}
            </div>
          ))}

          <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Email delivery</p>
                <p className="mt-1 text-xs text-slate-500">
                  Hostinger Mail API (recommended) uses HTTPS and works on Railway. SMTP is a fallback. Changing contact email updates who receives notifications and which mailbox sends (when login is blank).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={testEmailMutation.isPending}
                onClick={() => void handleSendTestEmail()}
              >
                <Send className="h-4 w-4" />
                Send test email
              </Button>
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Delivery method</label>
                <select
                  name="email_provider"
                  defaultValue={emailProvider}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand-gold-400 focus:outline-none focus:ring-2 focus:ring-brand-gold-400/30"
                >
                  <option value="hostinger_api">Hostinger Mail API (recommended)</option>
                  <option value="smtp">SMTP</option>
                </select>
              </div>

              {usesHostingerApi ? (
                <div className="sm:col-span-2">
                  <Input
                    name="hostinger_mail_api_token"
                    label="Hostinger Mail API token"
                    type="password"
                    placeholder="Paste token from hPanel → Agentic mail → API"
                    defaultValue={
                      values.hostinger_mail_api_token === '********' ? '' : values.hostinger_mail_api_token
                    }
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    Create a token in{' '}
                    <a
                      href="https://www.hostinger.com/support/how-to-use-agentic-mail-in-hpanel/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-primary-700 underline-offset-2 hover:underline"
                    >
                      Hostinger Agentic Mail
                    </a>
                    . Include the mailbox that matches your contact email.
                  </p>
                </div>
              ) : (
                SMTP_FIELDS.map(({ key, label, placeholder, ...rest }) => (
                  <div key={key} className={key === 'smtp_password' ? 'sm:col-span-2' : undefined}>
                    <Input
                      name={key}
                      label={label}
                      placeholder={placeholder}
                      defaultValue={key === 'smtp_password' && values[key] === '********' ? '' : values[key]}
                      {...('type' in rest ? { type: rest.type } : {})}
                      {...('inputMode' in rest ? { inputMode: rest.inputMode } : {})}
                    />
                  </div>
                ))
              )}
            </div>

            {emailStatusLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Spinner size="sm" />
                Checking email configuration…
              </div>
            ) : emailStatus ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {emailStatus.isConfigured ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-emerald-800">
                        {emailStatus.provider === 'hostinger_api'
                          ? `Ready to send via Hostinger Mail API`
                          : `Ready to send via ${emailStatus.host}:${emailStatus.port}`}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                      <span className="text-amber-800">Email delivery not fully configured</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  Notifications to: <span className="font-medium">{emailStatus.companyEmail}</span>
                  {' · '}
                  Send as:{' '}
                  <span className="font-medium">{emailStatus.from ?? emailStatus.username ?? '—'}</span>
                  {emailStatus.usesContactEmailAsLogin && (
                    <span className="text-slate-500"> (follows contact email)</span>
                  )}
                </p>
                {emailStatus.provider === 'hostinger_api' && !emailStatus.hasApiToken && (
                  <p className="text-xs text-amber-800">Add your Hostinger Mail API token and save.</p>
                )}
                {emailStatus.provider === 'smtp' && !emailStatus.hasPassword && (
                  <p className="text-xs text-amber-800">Add an SMTP password and save to enable sending.</p>
                )}
                {!emailStatus.isConfigured && emailStatus.configurationHint && (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {emailStatus.configurationHint}
                  </p>
                )}
              </div>
            ) : null}
          </div>

          <div className="sm:col-span-2 mt-2 border-t border-slate-100 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Office hours
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {OFFICE_HOURS_FIELDS.map((field) =>
                'type' in field && field.type === 'textarea' ? (
                  <div key={field.key} className="sm:col-span-2">
                    <Textarea
                      name={field.key}
                      label={field.label}
                      rows={3}
                      defaultValue={values[field.key] || field.default}
                    />
                  </div>
                ) : (
                  <Input
                    key={field.key}
                    name={field.key}
                    label={field.label}
                    defaultValue={values[field.key] || field.default}
                  />
                ),
              )}
            </div>
          </div>

          <div className="sm:col-span-2 border-t border-slate-100 pt-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Map embed
            </p>
            <p className="mb-3 text-xs text-slate-500">
              {MAP_FIELD.hint} You can paste the full iframe HTML — we extract the URL automatically.
            </p>
            <Textarea
              name={MAP_FIELD.key}
              label={MAP_FIELD.label}
              rows={3}
              placeholder={MAP_FIELD.placeholder}
              defaultValue={normalizeGoogleMapEmbedInput(values[MAP_FIELD.key])}
            />
          </div>
        </div>
      </form>
    </SettingsPanel>
  );
}
