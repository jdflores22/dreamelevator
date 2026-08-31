import { useMemo, useRef, useState } from 'react';
import { Copy, ImageIcon, Search, Trash2, Upload } from 'lucide-react';
import { useDeleteMedia, useMediaFiles } from '@/api/hooks';
import { AdminCard, AdminCardBody } from '@/components/admin/AdminCard';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { toast } from '@/store/toastStore';
import apiClient from '@/api/client';
import { resolveMediaUrl } from '@/utils/media';
import { cn } from '@/utils/cn';

const FOLDERS = [
  { id: 'all', label: 'All folders' },
  { id: 'pages', label: 'Pages' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'products', label: 'Products' },
  { id: 'technologies', label: 'Technologies' },
  { id: 'branding', label: 'Branding' },
  { id: 'clients', label: 'Clients' },
] as const;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryAdminPage() {
  const [folder, setFolder] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const deleteMedia = useDeleteMedia();

  const { data: files, isLoading, refetch } = useMediaFiles(
    folder === 'all' ? undefined : folder,
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files ?? [];
    return (files ?? []).filter(
      (f) =>
        f.fileName.toLowerCase().includes(q) ||
        f.folder.toLowerCase().includes(q),
    );
  }, [files, search]);

  const uploadFolder = folder === 'all' ? 'pages' : folder;

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await apiClient.post(`/upload?folder=${uploadFolder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refetch();
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader
        title="Media library"
        description="Browse, upload, and manage images used across the website."
        eyebrow="Assets"
        actions={
          <>
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
              isLoading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-4 w-4" />
              Upload to {uploadFolder}
            </Button>
          </>
        }
      />

      <AdminCard className="mb-6">
        <AdminCardBody className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or folder…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FOLDERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFolder(f.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  folder === f.id
                    ? 'bg-primary-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </AdminCardBody>
      </AdminCard>

      {filtered.length === 0 ? (
        <AdminEmptyState
          icon={ImageIcon}
          title="No images"
          description="Upload images here, then pick them from any content form."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((file) => (
            <AdminCard key={file.url} className="group">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <img
                  src={resolveMediaUrl(file.url)}
                  alt={file.fileName}
                  className="h-full w-full object-contain p-3"
                />
                <div className="absolute right-2 top-2 flex gap-1 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(file.url);
                      toast.success('URL copied');
                    }}
                    className="rounded-md bg-black/60 p-1.5 text-white hover:bg-black/80"
                    title="Copy URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${file.fileName}?`)) {
                        deleteMedia.mutate(file.url, {
                          onSuccess: () => toast.success('Deleted'),
                          onError: () => toast.error('Delete failed'),
                        });
                      }
                    }}
                    className="rounded-md bg-black/60 p-1.5 text-white hover:bg-brand-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <AdminCardBody className="py-3">
                <p className="truncate text-xs font-medium text-primary-900">{file.fileName}</p>
                <p className="mt-0.5 truncate text-[10px] text-slate-400">
                  {file.folder || 'uploads'} · {formatBytes(file.sizeBytes)}
                </p>
              </AdminCardBody>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
