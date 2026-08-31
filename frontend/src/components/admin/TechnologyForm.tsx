import { useForm, Controller } from 'react-hook-form';
import type { Technology } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUploadField } from '@/components/admin/ImageUploadField';

interface TechnologyFormProps {
  item?: Technology | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

interface FormValues {
  name: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  logo: string[];
}

function toFormValues(item?: Technology | null): FormValues {
  return {
    name: item?.name ?? '',
    category: item?.category ?? '',
    sortOrder: item?.sortOrder ?? 0,
    isPublished: item?.isPublished ?? true,
    logo: item?.iconUrl ? [item.iconUrl] : [],
  };
}

export function TechnologyForm({ item, isSubmitting, onCancel, onSubmit }: TechnologyFormProps) {
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: toFormValues(item),
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit({
          name: data.name,
          category: data.category,
          sortOrder: Number(data.sortOrder) || 0,
          isPublished: data.isPublished === true,
          iconUrl: data.logo[0] ?? '',
        }),
      )}
      className="space-y-4"
    >
      <Input label="Technology name" {...register('name', { required: true })} />

      <Input
        label="Category"
        {...register('category')}
        placeholder="e.g. Frontend, Backend, Database"
        list="technology-categories"
      />
      <datalist id="technology-categories">
        <option value="Frontend" />
        <option value="Backend" />
        <option value="Database" />
        <option value="Infrastructure" />
        <option value="Cloud" />
        <option value="Mobile" />
        <option value="Other" />
      </datalist>

      <Controller
        name="logo"
        control={control}
        render={({ field }) => (
          <ImageUploadField
            label="Technology logo"
            value={field.value}
            onChange={field.onChange}
            folder="technologies"
            multiple={false}
            preview="logo"
            uploadLabel="Upload logo"
            hint="Square PNG, SVG, or WebP works best for the tech stack carousel."
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
