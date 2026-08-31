import { useRef, useState } from 'react';
import { FolderOpen, ImageIcon, Trash2, Upload } from 'lucide-react';
import apiClient from '@/api/client';
import { MediaPickerModal } from '@/components/admin/MediaPickerModal';
import { Button } from '@/components/ui/Button';
import { resolveMediaUrl } from '@/utils/media';
import { cn } from '@/utils/cn';

interface ImageUploadFieldProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  multiple?: boolean;
  hint?: string;
  preview?: 'cover' | 'logo';
  uploadLabel?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'portfolio',
  multiple = true,
  hint,
  preview = 'cover',
  uploadLabel = 'Upload image',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<{ data: { url: string } }>(
        `/upload?folder=${folder}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      const url = data.data.url;
      onChange(multiple ? [...value, url] : [url]);
    } catch {
      setError('Upload failed. Use PNG, JPG, or WebP under 10 MB.');
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPickerOpen(true)}
          >
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
            {uploadLabel}
          </Button>
        </div>
      </div>

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

      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-brand-red-600">{error}</p>}

      {value.length === 0 ? (
        <div
          className={cn(
            'flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50',
            preview === 'logo' ? 'h-32 w-32' : 'h-36 w-full',
          )}
        >
          <div className="text-center text-slate-400">
            <ImageIcon className={cn('mx-auto', preview === 'logo' ? 'h-7 w-7' : 'h-8 w-8')} />
            <p className="mt-2 text-xs">No image uploaded yet</p>
          </div>
        </div>
      ) : (
        <div className={cn('grid gap-3', value.length > 1 ? 'grid-cols-2' : preview === 'logo' ? 'w-32' : 'grid-cols-1')}>
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-lg border border-slate-200">
              <img
                src={resolveMediaUrl(url)}
                alt=""
                className={cn(
                  'w-full',
                  preview === 'logo'
                    ? 'aspect-square bg-white object-contain p-3'
                    : 'aspect-video object-cover',
                )}
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(multiple ? [...value, url] : [url])}
        folder={folder}
      />
    </div>
  );
}
