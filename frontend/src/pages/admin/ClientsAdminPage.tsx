import {
  useAdminClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from '@/api/hooks';
import type { Client } from '@/types';
import { AdminCrudPage } from '@/components/admin/AdminCrudPage';
import { EntityForm } from '@/components/admin/EntityForm';
import { resolveMediaUrl } from '@/utils/media';

export default function ClientsAdminPage() {
  const { data: items, isLoading } = useAdminClients();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const deleteMutation = useDeleteClient();

  return (
    <AdminCrudPage<Client>
      title="Clients"
      description="Manage client companies"
      items={items}
      isLoading={isLoading}
      columns={[
        {
          key: 'logoUrl',
          label: 'Logo',
          sortable: false,
          render: (item) =>
            item.logoUrl ? (
              <img
                src={resolveMediaUrl(item.logoUrl)}
                alt=""
                className="h-9 w-14 object-contain"
              />
            ) : (
              <span className="text-xs text-slate-400">No logo</span>
            ),
        },
        { key: 'name', label: 'Name' },
        { key: 'location', label: 'Location' },
        { key: 'website', label: 'Website' },
      ]}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      formContent={(item, onClose) => (
        <EntityForm
          defaultValues={item || { isPublished: true }}
          fields={[
            { name: 'name', label: 'Name' },
            { name: 'location', label: 'Location' },
            {
              name: 'logoUrl',
              label: 'Logo',
              type: 'image',
              folder: 'clients',
              preview: 'logo',
              hint: 'Upload a PNG, SVG, or WebP. This is the mark shown in the homepage carousel.',
            },
            { name: 'website', label: 'Website' },
            { name: 'isPublished', label: 'Published', type: 'checkbox' },
          ]}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onCancel={onClose}
          onSubmit={(data) => {
            if (item) {
              updateMutation.mutate({ id: item.id, data }, { onSuccess: onClose });
            } else {
              createMutation.mutate(data as never, { onSuccess: onClose });
            }
          }}
        />
      )}
    />
  );
}
