import { useForm, Controller } from 'react-hook-form';
import type { Portfolio } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUploadField } from '@/components/admin/ImageUploadField';
import { parseRawPortfolioImages, serializePortfolioImages } from '@/utils/portfolio';

interface PortfolioFormProps {
  item?: Portfolio | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

interface FormValues {
  title: string;
  slug: string;
  description: string;
  content: string;
  techStackJson: string;
  sortOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  logo: string[];
  images: string[];
}

function toFormValues(item?: Portfolio | null): FormValues {
  return {
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    description: item?.description ?? '',
    content: item?.content ?? '',
    techStackJson: item?.techStackJson ?? '[]',
    sortOrder: item?.sortOrder ?? 0,
    isFeatured: item?.isFeatured ?? false,
    isPublished: item?.isPublished ?? true,
    logo: item?.logoUrl ? [item.logoUrl] : [],
    images: parseRawPortfolioImages(item?.imagesJson ?? '[]'),
  };
}

export function PortfolioForm({ item, isSubmitting, onCancel, onSubmit }: PortfolioFormProps) {
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: toFormValues(item),
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-'),
          description: data.description,
          content: data.content,
          techStackJson: data.techStackJson || '[]',
          sortOrder: Number(data.sortOrder) || 0,
          isFeatured: data.isFeatured === true,
          isPublished: data.isPublished === true,
          logoUrl: data.logo[0] ?? '',
          imagesJson: serializePortfolioImages(data.images),
        }),
      )}
      className="space-y-4"
    >
      <Input label="Title" {...register('title', { required: true })} />
      <Input label="Slug" {...register('slug')} placeholder="auto-generated from title if empty" />
      <Textarea label="Description" rows={2} {...register('description')} />
      <Textarea label="Content" rows={5} {...register('content')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="logo"
          control={control}
          render={({ field }) => (
            <ImageUploadField
              label="Project logo"
              value={field.value}
              onChange={field.onChange}
              folder="portfolio/logos"
              multiple={false}
              preview="logo"
              uploadLabel="Upload logo"
              hint="Brand or client logo. Shown on cards and project pages."
            />
          )}
        />

        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploadField
              label="Project images"
              value={field.value}
              onChange={field.onChange}
              folder="portfolio"
              hint="Cover and gallery photos. First image is the card cover."
            />
          )}
        />
      </div>

      <Input
        label="Tech stack (JSON array)"
        {...register('techStackJson')}
        placeholder='["React", "Node.js"]'
      />
      <Input label="Sort order" type="number" {...register('sortOrder', { valueAsNumber: true })} />

      <Controller
        name="isFeatured"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              className="rounded"
            />
            Featured
          </label>
        )}
      />

      <Controller
        name="isPublished"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              className="rounded"
            />
            Published
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
