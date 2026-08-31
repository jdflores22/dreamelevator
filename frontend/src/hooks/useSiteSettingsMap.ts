import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApiClient } from '@/api/client';
import type { ApiResponse, SiteSetting } from '@/types';
import { applyBrandName } from '@/utils/brand';

export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['settings', 'public'],
    queryFn: async () => {
      const { data } = await publicApiClient.get<ApiResponse<SiteSetting[]>>('/settings');
      return data.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useSiteSettingsMap() {
  const query = usePublicSiteSettings();

  const map = useMemo(() => {
    const entries: Record<string, string> = {};
    query.data?.forEach((setting) => {
      entries[setting.key] = setting.value;
    });
    return entries;
  }, [query.data]);

  const companyName = (map.company_name ?? '').trim();

  const get = useCallback(
    (key: string, fallback = '') => {
      const raw = map[key] ?? fallback;
      if (key === 'company_name' || !companyName) return raw;
      return applyBrandName(raw, companyName);
    },
    [map, companyName],
  );

  return { ...query, map, get };
}
