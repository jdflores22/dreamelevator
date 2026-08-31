import {
  useAdminServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useReorderServices,
} from '@/api/hooks';
import type { Service } from '@/types';
import { AdminCrudPage } from '@/components/admin/AdminCrudPage';
import { EntityForm } from '@/components/admin/EntityForm';
import { Badge } from '@/components/ui/Badge';

export default function ServicesAdminPage() {
  const { data: items, isLoading } = useAdminServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const reorderMutation = useReorderServices();

  return (
    <AdminCrudPage<Service>
      title="Services"
      description="Manage service offerings"
      items={items}
      isLoading={isLoading}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'slug', label: 'Slug' },
        {
          key: 'isPublished',
          label: 'Status',
          render: (item) => (
            <Badge variant={item.isPublished ? 'success' : 'warning'}>
              {item.isPublished ? 'Published' : 'Draft'}
            </Badge>
          ),
        },
      ]}
      onReorder={(ordered) => reorderMutation.mutateAsync(ordered)}
      isReordering={reorderMutation.isPending}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      formContent={(item, onClose) => (
        <EntityForm
          defaultValues={item || { sortOrder: 0, isPublished: true }}
          fields={[
            { name: 'title', label: 'Title' },
            { name: 'slug', label: 'Slug' },
            { name: 'shortDescription', label: 'Short Description', type: 'textarea', rows: 2 },
            { name: 'description', label: 'Description', type: 'richtext' },
            { name: 'icon', label: 'Icon' },
            { name: 'sortOrder', label: 'Sort Order', type: 'number' },
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
