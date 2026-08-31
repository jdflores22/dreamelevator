export const CONTACT_SENDER_TYPES = [
  { value: 'building_owner', label: 'Building owner / property manager' },
  { value: 'contractor', label: 'Contractor / developer' },
  { value: 'facility', label: 'Facility or maintenance team' },
  { value: 'other', label: 'Other' },
] as const;

export type ContactSenderType = (typeof CONTACT_SENDER_TYPES)[number]['value'];

const LEGACY_SENDER_LABELS: Record<string, string> = {
  trucker: 'Trucker',
  shipping_lines: 'Shipping Lines',
  container_yard: 'Container Yard',
  private_company: 'Private Company',
};

export function formatContactSenderType(value?: string | null): string {
  if (!value) return 'Not specified';
  const match = CONTACT_SENDER_TYPES.find((item) => item.value === value);
  if (match) return match.label;
  return LEGACY_SENDER_LABELS[value] ?? value;
}
