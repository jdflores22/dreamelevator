import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, FolderOpen, ImageIcon, Trash2, Upload } from 'lucide-react';
import apiClient from '@/api/client';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { GalleryImage } from '@/utils/gallery';
import { resolveMediaUrl } from '@/utils/media';

/**
 * Gallery photos with a caption each. The caption doubles as the category label
 * for the filter chips on /gallery, so photos sharing one become a group.
 */
export function GalleryPhotosField({
  value,
  onChange,
}: {
  value: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = (src: string) => onChange([...value, { src, alt: '' }]);

  const update = (index: number, patch: Partial<GalleryImage>) =>
    onChange(value.map((image, i) => (i === index ? { ...image, ...patch } : image)));

  const removeAt = (index: number) => onChange(value.filter((_, i) => i !== index));

  const move = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<{ data: { url: string } }>(
        '/upload?folder=gallery',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      add(data.data.url);
    } catch {
      setError('Upload failed. Use PNG, JPG, or WebP under 10 MB.');
    } finally {
      setUploading(false);
    }
  };

  const categories = [...new Set(value.map((image) => image.alt.trim()).filter(Boolean))];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">Photos</label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
            <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
            Library
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            isLoading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload photo
          </Button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Shown on /gallery in this order. The caption groups photos into filter chips — reuse the
        same wording (for example “Installation”) to put photos in one group.
      </p>
      {categories.length > 0 && (
        <p className="text-xs text-slate-500">
          Groups so far: <span className="text-primary-800">{categories.join(', ')}</span>
        </p>
      )}
      {error && <p className="text-xs text-brand-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {value.length === 0 ? (
        <div className="flex h-36 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
          <div className="text-center text-slate-400">
            <ImageIcon className="mx-auto h-8 w-8" />
            <p className="mt-2 text-xs">No photos yet — upload or pick from the library</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {value.map((image, index) => (
            <li
              key={`${image.src}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2"
            >
              <img
                src={resolveMediaUrl(image.src)}
                alt=""
                className="h-16 w-20 shrink-0 rounded-md bg-slate-100 object-cover"
              />
              <div className="min-w-0 flex-1">
                <Input
                  label=""
                  placeholder="Caption / group (for example Installation)"
                  value={image.alt}
                  onChange={(e) => update(index, { alt: e.target.value })}
                />
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Move photo up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                  aria-label="Move photo down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-brand-red-500/10 hover:text-brand-red-600"
                aria-label="Remove photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => add(url)}
        folder="gallery"
      />
    </div>
  );
}
