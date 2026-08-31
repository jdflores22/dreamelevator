import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'richtext' | 'image' | 'select';
  rows?: number;
  folder?: string;
  preview?: 'cover' | 'logo';
  options?: { value: string | number; label: string }[];
  hint?: string;
}

export interface EntityFormProps {
  defaultValues?: object;
  fields: FormField[];
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function normalizeFormData(
  data: Record<string, unknown>,
  fields: FormField[],
): Record<string, unknown> {
  const normalized = { ...data };

  for (const field of fields) {
    if (field.type === 'checkbox') {
      normalized[field.name] = data[field.name] === true;
    } else if (field.type === 'number') {
      normalized[field.name] = Number(data[field.name]) || 0;
    } else if (field.type === 'select' && field.name === 'homepageRow') {
      normalized[field.name] = Number(data[field.name]) === 2 ? 2 : 1;
    }
  }

  return normalized;
}

export function EntityForm({
  defaultValues,
  fields,
  onSubmit,
  onCancel,
  isSubmitting,
}: EntityFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<Record<string, unknown>>({
    defaultValues: defaultValues as Record<string, unknown>,
  });

  useUnsavedChanges(isDirty && !isSubmitting);

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(normalizeFormData(data, fields)))}
      className="space-y-5"
    >
      {fields.map((field) => {
        if (field.type === 'richtext') {
          return (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              render={({ field: f }) => (
                <RichTextEditor
                  label={field.label}
                  value={String(f.value ?? '')}
                  onChange={f.onChange}
                />
              )}
            />
          );
        }

        if (field.type === 'image') {
          return (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              render={({ field: f }) => (
                <ImageUploadField
                  label={field.label}
                  value={f.value ? [String(f.value)] : []}
                  onChange={(urls) => f.onChange(urls[0] ?? '')}
                  folder={field.folder ?? 'pages'}
                  multiple={false}
                  preview={field.preview ?? 'cover'}
                  hint={field.hint}
                  uploadLabel="Upload"
                />
              )}
            />
          );
        }

        if (field.type === 'textarea') {
          return (
            <Textarea
              key={field.name}
              label={field.label}
              rows={field.rows || 4}
              {...register(field.name)}
            />
          );
        }

        if (field.type === 'checkbox') {
          return (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              render={({ field: f }) => (
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(f.value)}
                    onChange={(e) => f.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-brand-gold-400"
                  />
                  <span className="font-medium text-primary-900">{field.label}</span>
                </label>
              )}
            />
          );
        }

        if (field.type === 'select') {
          return (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              render={({ field: f }) => (
                <div>
                  <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-slate-700">
                    {field.label}
                  </label>
                  <select
                    id={field.name}
                    value={String(f.value ?? field.options?.[0]?.value ?? '')}
                    onChange={(e) => f.onChange(field.name === 'homepageRow' ? Number(e.target.value) : e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {field.hint && <p className="mt-1 text-xs text-slate-500">{field.hint}</p>}
                </div>
              )}
            />
          );
        }

        return (
          <Input
            key={field.name}
            label={field.label}
            type={field.type || 'text'}
            {...register(field.name)}
          />
        );
      })}
      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
          Save changes
        </Button>
      </div>
    </form>
  );
}
