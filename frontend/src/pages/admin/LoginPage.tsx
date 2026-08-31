import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/api/hooks';
import { homePathForRole, isCmsAdminPath, isCmsRole } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { loginMutation } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';

  if (isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data, {
      onSuccess: (result) => {
        const role = result.user.roleName ?? result.user.role;
        const dest = isCmsRole(role) && isCmsAdminPath(from) ? from : homePathForRole(role);
        navigate(dest, { replace: true });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {loginMutation.isError && (
        <div className="rounded-lg border border-brand-red-500/20 bg-brand-red-500/10 px-4 py-3 text-sm text-brand-red-700">
          Invalid email or password. Please try again.
        </div>
      )}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" size="lg" isLoading={loginMutation.isPending}>
        Sign in
      </Button>
    </form>
  );
}
