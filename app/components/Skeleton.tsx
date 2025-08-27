'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      case 'rectangular':
        return 'rounded-none';
      case 'text':
      default:
        return 'rounded h-4 mb-2';
    }
  };

  const getAnimationClasses = () => {
    switch (animation) {
      case 'wave':
        return 'skeleton';
      case 'pulse':
        return 'animate-pulse bg-gradient-to-r from-background-secondary via-background-tertiary to-background-secondary';
      case 'none':
      default:
        return 'bg-background-secondary';
    }
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? undefined : '100%'),
  };

  return (
    <div
      className={`${getVariantClasses()} ${getAnimationClasses()} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card space-y-4">
      <Skeleton variant="rounded" height={200} className="mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonButton() {
  return (
    <Skeleton
      variant="rounded"
      height={44}
      className="w-full"
      animation="pulse"
    />
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      animation="pulse"
    />
  );
}