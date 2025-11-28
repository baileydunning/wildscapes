import { TerrainType } from '@/types/game';
import { cn } from '@/lib/utils';

interface TerrainTokenProps {
  type: TerrainType;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  showHeight?: number;
  asDiv?: boolean;
}

const sizeClasses = {
  sm: 'w-5 h-5 text-[8px]',
  md: 'w-8 h-8 text-[10px]',
  lg: 'w-10 h-10 text-xs',
};

const terrainColors: Record<TerrainType, { bg: string; border: string }> = {
  field: { bg: '#E7C86E', border: '#D4B85A' },
  water: { bg: '#4C8FD6', border: '#3A7BC4' },
  mountain: { bg: '#8A8F99', border: '#7A7F89' },
  trunk: { bg: '#8B5A2B', border: '#7A4A1B' },
  treetop: { bg: '#3A7F3A', border: '#2A6F2A' },
  building: { bg: '#C44848', border: '#B43838' },
};

export function TerrainToken({
  type,
  size = 'md',
  onClick,
  selected,
  disabled,
  className,
  showHeight,
  asDiv = false,
}: TerrainTokenProps) {
  const isRound = type === 'treetop';
  const colors = terrainColors[type];
  
  const commonClasses = cn(
    'flex items-center justify-center border-2 transition-all duration-150 font-sans',
    sizeClasses[size],
    isRound ? 'rounded-full' : 'rounded-sm',
    selected && 'ring-2 ring-foreground ring-offset-1 ring-offset-background scale-110',
    disabled && type !== 'building' && 'opacity-50 cursor-not-allowed',
    disabled && type === 'building' && 'cursor-not-allowed',
    !disabled && onClick && 'hover:scale-105 active:scale-95 cursor-pointer',
    !onClick && !asDiv && 'cursor-default',
    className
  );
  
  const commonStyle = {
    backgroundColor: colors.bg,
    borderColor: colors.border,
  };
  
  const content = showHeight && showHeight > 1 ? (
    <span className="font-medium text-white/90 drop-shadow-sm">
      {showHeight}
    </span>
  ) : null;
  
  if (asDiv) {
    return (
      <div
        style={commonStyle}
        className={commonClasses}
        aria-label={type}
      >
        {content}
      </div>
    );
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={commonStyle}
      className={commonClasses}
      aria-label={type}
    >
      {content}
    </button>
  );
}
