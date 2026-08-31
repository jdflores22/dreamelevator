import { cn } from '@/utils/cn';
import { ShaftAtmosphere } from '@/components/effects/ShaftAtmosphere';

interface TechBackgroundProps {
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  showGrid?: boolean;
  showScan?: boolean;
  showNodes?: boolean;
  showHex?: boolean;
}

export function TechBackground({
  className,
  intensity = 'medium',
}: TechBackgroundProps) {
  const opacity =
    intensity === 'subtle' ? 'opacity-40' : intensity === 'strong' ? 'opacity-100' : 'opacity-70';

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', opacity, className)}
      aria-hidden
    >
      <ShaftAtmosphere isDark showRail={false} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-950/30" />
    </div>
  );
}

interface TechSectionMeshProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export function TechSectionMesh({ className, variant = 'light' }: TechSectionMeshProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        variant === 'light' ? 'tech-mesh-light' : 'tech-mesh-dark',
        className,
      )}
      aria-hidden
    />
  );
}
