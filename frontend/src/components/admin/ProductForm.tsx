import { useForm, Controller } from 'react-hook-form';
import type { SoftwareProduct } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface ProductFormProps {
  item?: SoftwareProduct | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

interface FormValues {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  featuresText: string;
  sortOrder: number;
  isPublished: boolean;
  isFeatured: boolean;
  homepageRow: number;
  logo: string[];
  screenshots: string[];
}

function parseJsonArray(value?: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

function toFormValues(item?: SoftwareProduct | null): FormValues {
  const features = parseJsonArray(item?.featuresJson);
  return {
    name: item?.name ?? '',
    slug: item?.slug ?? '',
    shortDescription: item?.shortDescription ?? '',
    description: item?.description ?? '',
    featuresText: features.join('\n'),
    sortOrder: item?.sortOrder ?? 0,
    isPublished: item?.isPublished ?? true,
    isFeatured: item?.isFeatured ?? false,
    homepageRow: item?.homepageRow ?? 1,
    logo: item?.logoUrl ? [item.logoUrl] : [],
    screenshots: parseJsonArray(item?.screenshotsJson),
  };
}

export function ProductForm({ item, isSubmitting, onCancel, onSubmit }: ProductFormProps) {
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
          description: data.description,
          featuresJson: JSON.stringify(
            data.featuresText.split('\n').map((line) => line.trimEnd()),
          ),
          screenshotsJson: JSON.stringify(data.screenshots),
          sortOrder: Number(data.sortOrder) || 0,
          isPublished: data.isPublished === true,
          isFeatured: data.isFeatured === true,
          homepageRow: Number(data.homepageRow) === 2 ? 2 : 1,
          logoUrl: data.logo[0] ?? '',
        }),
      )}
      className="space-y-4"
    >
      <Input label="Product name" {...register('name', { required: true })} />
      <Input label="Slug" {...register('slug')} placeholder="auto-generated if empty" />
      <Textarea
        label="Short description"
        rows={2}
        className="whitespace-pre-wrap"
        {...register('shortDescription')}
        placeholder="Brief description shown on listing cards"
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full description</label>
            <RichTextEditor value={field.value} onChange={field.onChange} />
          </div>
        )}
      />

      <Textarea
        label="Key features"
        rows={5}
        className="whitespace-pre-wrap"
        {...register('featuresText')}
        placeholder="One feature per line (blank lines are kept as spacing)"
      />
      <p className="-mt-2 text-xs text-slate-500">Shown in the product detail sidebar.</p>

      <Controller
        name="logo"
        control={control}
        render={({ field }) => (
          <ImageUploadField
            label="Product logo"
            value={field.value}
            onChange={field.onChange}
            folder="products"
            multiple={false}
            preview="logo"
            uploadLabel="Upload logo"
            hint="Logo or icon for this software product (ECMS, CRM, etc.)."
          />
        )}
      />

      <Controller
        name="screenshots"
        control={control}
        render={({ field }) => (
          <ImageUploadField
            label="Screenshots"
            value={field.value}
            onChange={field.onChange}
            folder="products"
            multiple
            preview="cover"
            uploadLabel="Upload screenshots"
            hint="Product UI screenshots. On a featured product, 2 or more images enable slide mode in the spotlight."
          />
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Sort order" type="number" {...register('sortOrder', { valueAsNumber: true })} />
        <Controller
          name="homepageRow"
          control={control}
          render={({ field }) => (
            <div>
              <label htmlFor="homepageRow" className="mb-1.5 block text-sm font-medium text-slate-700">
                Homepage row
              </label>
              <select
                id="homepageRow"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value={1}>First row</option>
                <option value={2}>Second row</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">Which row this product appears in on the homepage grid.</p>
            </div>
          )}
        />
      </div>

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

      <Controller
        name="isFeatured"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-3 rounded-lg border border-brand-gold-200 bg-brand-gold-50/50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-gold-600"
            />
            <span>
              <span className="font-medium text-primary-900">Highlight on homepage</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Shows this product in the featured spotlight section. Only one product can be featured at a time.
              </span>
            </span>
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
