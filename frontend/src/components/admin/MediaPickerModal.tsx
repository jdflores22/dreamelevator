import { useMemo, useRef, useState } from 'react';
import { Check, Copy, ImageIcon, Search, Trash2, Upload } from 'lucide-react';
import { useDeleteMedia, useMediaFiles } from '@/api/hooks';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/store/toastStore';
import apiClient from '@/api/client';
import { resolveMediaUrl } from '@/utils/media';
import { cn } from '@/utils/cn';

const FOLDERS = [
  { id: 'all', label: 'All' },
  { id: 'pages', label: 'Pages' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'products', label: 'Products' },
  { id: 'technologies', label: 'Technologies' },
  { id: 'branding', label: 'Branding' },
  { id: 'uploads', label: 'General' },
] as const;

export interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  folder?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPickerModal({ isOpen, onClose, onSelect, folder }: MediaPickerModalProps) {
  const [activeFolder, setActiveFolder] = useState(folder ?? 'all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const deleteMedia = useDeleteMedia();

  const { data: files, isLoading, refetch } = useMediaFiles(
    activeFolder === 'all' ? undefined : activeFolder,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files ?? [];
    return (files ?? []).filter(
      (f) =>
        f.fileName.toLowerCase().includes(q) ||
        f.folder.toLowerCase().includes(q) ||
        f.url.toLowerCase().includes(q),
    );
  }, [files, search]);

  const uploadTargetFolder = activeFolder === 'all' ? folder ?? 'pages' : activeFolder;

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<{ data: { url: string } }>(
        `/upload?folder=${uploadTargetFolder}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      await refetch();
      setSelected(data.data.url);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    void navigator.clipboard.writeText(url);
    toast.success('URL copied');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Media library" size="xl">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files…"
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = '';
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Upload
            </Button>
            {selected && (
              <Button type="button" size="sm" onClick={() => onSelect(selected)}>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Use selected
              </Button>
            )}
          </div>
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto overscroll-x-contain px-1 pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap">
          {FOLDERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFolder(f.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                activeFolder === f.id
                  ? 'bg-primary-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-slate-400">
            <ImageIcon className="h-10 w-10" />
            <p className="mt-3 text-sm">No images found in this folder.</p>
          </div>
        ) : (
          <div className="grid max-h-[28rem] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((file) => {
              const isSelected = selected === file.url;
              return (
                <button
                  key={file.url}
                  type="button"
                  onClick={() => setSelected(file.url)}
                  className={cn(
                    'group relative overflow-hidden rounded-lg border text-left transition-all',
                    isSelected
                      ? 'border-brand-gold-500 ring-2 ring-brand-gold-500/30'
                      : 'border-slate-200 hover:border-brand-gold-500/40',
                  )}
                >
                  <img
                    src={resolveMediaUrl(file.url)}
                    alt={file.fileName}
                    className="aspect-square w-full bg-slate-50 object-contain p-2"
                  />
                  <div className="border-t border-slate-100 bg-white px-2 py-1.5">
                    <p className="truncate text-[10px] font-medium text-primary-900">
                      {file.fileName}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {file.folder || 'uploads'} · {formatBytes(file.sizeBytes)}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold-500 text-primary-950">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <div className="absolute left-2 top-2 flex gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyUrl(file.url);
                      }}
                      className="rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80"
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete ${file.fileName}?`)) {
                          deleteMedia.mutate(file.url, {
                            onSuccess: () => {
                              if (selected === file.url) setSelected(null);
                              toast.success('File deleted');
                            },
                            onError: () => toast.error('Delete failed'),
                          });
                        }
                      }}
                      className="rounded-md bg-black/60 p-1.5 text-white hover:bg-brand-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
