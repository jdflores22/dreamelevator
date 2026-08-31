import type { Service } from '@/types';

export function sortServices(services: Service[]) {
  return [...services].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function isMaintenanceService(service: Service) {
  const hay = `${service.slug} ${service.title}`.toLowerCase();
  return hay.includes('maintenance');
}

export function findMaintenanceService(services: Service[]) {
  return sortServices(services).find(isMaintenanceService) ?? null;
}

export function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}
