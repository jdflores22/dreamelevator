import { useForm, Controller } from 'react-hook-form';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useRoles,
} from '@/api/hooks';
import { formatRoleLabel, sortRoles } from '@/constants/roles';
import type { User } from '@/types';
import { AdminCrudPage } from '@/components/admin/AdminCrudPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface UserFormValues {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  roleId: string;
  isActive: boolean;
}

interface UserFormProps {
  item?: User | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (data: UserFormValues) => void;
}

function UserForm({ item, isSubmitting, onCancel, onSubmit }: UserFormProps) {
  const { data: roles } = useRoles();
  const { register, handleSubmit, control } = useForm<UserFormValues>({
    defaultValues: {
      email: item?.email ?? '',
      firstName: item?.firstName ?? '',
      lastName: item?.lastName ?? '',
      roleId: item?.roleId ?? roles?.[0]?.id ?? '00000000-0000-0000-0000-000000000001',
      isActive: item?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Email" type="email" {...register('email', { required: true })} />
      {!item && (
        <Input label="Password" type="password" {...register('password', { required: true })} />
      )}
      <Input label="First Name" {...register('firstName', { required: true })} />
      <Input label="Last Name" {...register('lastName', { required: true })} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
        <Controller
          name="roleId"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-primary-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {sortRoles(roles ?? []).map((role) => (
                <option key={role.id} value={role.id}>
                  {formatRoleLabel(role.name)}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={Boolean(field.value)}
              onChange={(e) => field.onChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary-700"
            />
            <span className="font-medium text-primary-900">Active</span>
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

export default function UsersAdminPage() {
  const { data: items, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const roleName = (roleId: string) => roles?.find((r) => r.id === roleId)?.name ?? roleId;

  return (
    <AdminCrudPage<User>
      title="Users"
      description="Assign Developer, Staff, Accounting, or Admin access"
      items={items}
      isLoading={isLoading}
      columns={[
        { key: 'email', label: 'Email' },
        {
          key: 'firstName',
          label: 'Name',
          render: (item) => `${item.firstName} ${item.lastName}`,
        },
        {
          key: 'roleId',
          label: 'Role',
          render: (item) => (
            <Badge variant="accent">
              {formatRoleLabel(item.roleName ?? item.role?.name ?? roleName(item.roleId))}
            </Badge>
          ),
        },
        {
          key: 'isActive',
          label: 'Status',
          render: (item) => (
            <Badge variant={item.isActive ? 'success' : 'danger'}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Badge>
          ),
        },
      ]}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
      formContent={(item, onClose) => (
        <UserForm
          item={item}
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
