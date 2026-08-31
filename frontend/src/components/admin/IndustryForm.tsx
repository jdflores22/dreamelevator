import { useForm, Controller } from 'react-hook-form';
import type { Industry } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

interface IndustryFormProps {
  item?: Industry | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

interface FormValues {
  name: string;
  slug: string;
  shortDescription: string;
  sortOrder: number;
  isPublished: boolean;
  icon: string[];
}

function toFormValues(item?: Industry | null): FormValues {
  return {
    name: item?.name ?? '',
    slug: item?.slug ?? '',
    shortDescription: item?.shortDescription ?? '',
    sortOrder: item?.sortOrder ?? 0,
    isPublished: item?.isPublished ?? true,
    icon: item?.iconUrl ? [item.iconUrl] : [],
  };
}

export function IndustryForm({ item, isSubmitting, onCancel, onSubmit }: IndustryFormProps) {
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: toFormValues(item),
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
          shortDescription: data.shortDescription,
          sortOrder: Number(data.sortOrder) || 0,
          isPublished: data.isPublished === true,
          iconUrl: data.icon[0] ?? '',
        }),
      )}
      className="space-y-4"
    >
      <Input label="Industry name" {...register('name', { required: true })} />
      <Input label="Slug" {...register('slug')} placeholder="auto-generated if empty" />
      <Textarea
        label="Description"
        rows={3}
        {...register('shortDescription')}
        placeholder="Brief description shown on the industries pages"
      />

      <Controller
        name="icon"
        control={control}
        render={({ field }) => (
          <ImageUploadField
            label="Industry icon"
            value={field.value}
            onChange={field.onChange}
            folder="industries"
            multiple={false}
            preview="logo"
            uploadLabel="Upload icon"
            hint="Optional icon or logo for this industry sector."
          />
        )}
      />

      <Input label="Sort order" type="number" {...register('sortOrder', { valueAsNumber: true })} />

      <Controller
        name="isPublished"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary-700"
            />
            <span className="font-medium text-primary-900">Published on website</span>
          </label>
        )}
      />

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
