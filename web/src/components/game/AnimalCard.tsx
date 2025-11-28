import { AnimalCard as AnimalCardType, HabitatCell, PlacedAnimalEmoji } from '@/types/game';
import { cn } from '@/lib/utils';

interface AnimalCardProps {
  card: AnimalCardType;
  onClick?: () => void;
  selected?: boolean;
  completed?: boolean;
  inHand?: boolean;
  disabled?: boolean;
  compact?: boolean;
  placedEmojis?: PlacedAnimalEmoji[];
  selectedHabitatIndex?: number | null;
  onHabitatClick?: (habitatIndex: number) => void;
  isPlaceCubesPhase?: boolean;
}

const terrainColors: Record<string, string> = {
  field: '#E7C86E',
  water: '#4C8FD6',
  mountain: '#8A8F99',
  trunk: '#8B5A2B',
  treetop: '#3A7F3A',
  building: '#C44848',
};

const terrainNames: Record<string, string> = {
  field: 'Field',
  water: 'Water',
  mountain: 'Mountain',
  trunk: 'Trunk',
  treetop: 'Tree Top',
  building: 'Roof',
};

function HabitatToken({ cell, compact }: { cell: HabitatCell; compact?: boolean }) {
  const color = terrainColors[cell.terrain];
  const stackLabel = cell.stackLevel > 0 ? `H${cell.stackLevel + 1}` : '';
  
  return (
    <div className="relative flex flex-col items-center gap-0.5">
      <div
        className={cn(
          'rounded border border-black/20 shadow-sm',
          compact ? 'w-5 h-5' : 'w-6 h-6'
        )}
        style={{ backgroundColor: color }}
      />
      {stackLabel && (
        <span className="text-[8px] font-medium text-muted-foreground">{stackLabel}</span>
      )}
    </div>
  );
}

function PlaceableEmoji({
  emoji,
  isPlaced,
  isSelected,
  onClick,
  isInteractive
}: {
  emoji: string;
  isPlaced: boolean;
  isSelected: boolean;
  onClick?: () => void;
  isInteractive: boolean;
}) {
  if (isPlaced) {
    return (
      <div className="w-9 h-9 rounded-lg bg-muted/60 border border-dashed border-muted-foreground/30 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground font-medium">Done</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!isInteractive}
      className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all duration-150 border-2',
        isInteractive && 'cursor-pointer hover:scale-110 hover:shadow-md active:scale-95',
        !isInteractive && 'cursor-default border-transparent bg-muted/30',
        isInteractive && !isSelected && 'border-muted-foreground/20 bg-card hover:border-primary/50',
        isSelected && 'border-primary bg-primary/10 scale-110 shadow-md'
      )}
    >
      {emoji}
    </button>
  );
}

export function AnimalCard({ 
  card, 
  onClick, 
  selected, 
  completed, 
  inHand, 
  disabled, 
  compact,
  placedEmojis = [],
  selectedHabitatIndex,
  onHabitatClick,
  isPlaceCubesPhase
}: AnimalCardProps) {
  const cardEmojis = placedEmojis.filter(e => e.cardId === card.id);
  const placedIndices = new Set(cardEmojis.map(e => e.habitatIndex));
  const totalRequired = card.habitat.length;
  const placedCount = cardEmojis.length;
  const remainingToPlace = totalRequired - placedCount;
  
  // Frame colors now come from the card itself
  const frameColors = card.frameColors ?? { 
    primary: '#6B7280',   // default gray
    secondary: '#F3F4F6', // default light background
  };
  
  // Organize habitat cells by their relative positions for visual layout
  const minQ = Math.min(...card.habitat.map(h => h.relativePos.q));
  const maxQ = Math.max(...card.habitat.map(h => h.relativePos.q));
  const minR = Math.min(...card.habitat.map(h => h.relativePos.r));
  const maxR = Math.max(...card.habitat.map(h => h.relativePos.r));
  
  const cols = maxQ - minQ + 1;
  const rows = maxR - minR + 1;
  
  // Create a grid layout
  const grid: (HabitatCell & { index: number } | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));
  
  card.habitat.forEach((cell, index) => {
    const col = cell.relativePos.q - minQ;
    const row = cell.relativePos.r - minR;
    grid[row][col] = { ...cell, index };
  });

  // Create array of emoji slots for "Animals to Place"
  const emojiSlots = Array.from({ length: totalRequired }, (_, index) => ({
    index,
    isPlaced: placedIndices.has(index),
    isSelected: selectedHabitatIndex === index
  }));

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden font-sans transition-all duration-150 shadow-lg',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        completed && 'ring-2 ring-green-500',
        disabled && 'opacity-60',
        'mx-auto',
        'min-h-[320px]'
      )}
      style={{
        border: `3px solid ${completed ? '#22C55E' : frameColors.primary}`,
        backgroundColor: frameColors.secondary,
        maxWidth: '220px',
        width: '100%',
        minWidth: '180px',
      }}
    >
      {/* Top Bar - Name and Points */}
      <div 
        className="flex items-center justify-between px-3 py-1.5"
        style={{ backgroundColor: frameColors.primary }}
      >
        <h4
          className={cn(
            'font-bold text-white truncate drop-shadow-sm',
            compact ? 'text-xs' : 'text-sm'
          )}
        >
          {card.name}
        </h4>
        <div
          className={cn(
            'flex-shrink-0 min-w-7 h-7 px-2 rounded-full flex items-center justify-center font-bold bg-white shadow-sm',
            compact ? 'text-sm' : 'text-base'
          )}
          style={{ color: frameColors.primary }}
        >
          {card.points}
        </div>
      </div>
      
      {/* Art Frame - Large Emoji */}
      <div className={cn('px-3 pt-3 pb-2', compact && 'px-2 pt-2 pb-1')}>
        <div 
          className="relative rounded-lg border-2 flex items-center justify-center bg-white/80"
          style={{ 
            borderColor: frameColors.primary + '40',
            height: compact ? '70px' : '90px'
          }}
        >
          <span
            className={cn(
              'select-none drop-shadow-sm',
              compact ? 'text-5xl' : 'text-6xl'
            )}
          >
            {card.emoji}
          </span>
          {completed && (
            <div className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-700 font-bold text-sm uppercase tracking-wide bg-white/90 px-3 py-1 rounded-full shadow">
                Complete
              </span>
            </div>
          )}
        </div>
        
        {/* Species name */}
        <p
          className={cn(
            'text-center italic mt-1',
            compact ? 'text-[10px]' : 'text-xs'
          )}
          style={{ color: frameColors.primary }}
        >
          {card.species}
        </p>
      </div>
      
      {/* Required Habitat Section */}
      <div 
        className={cn('mx-3 mb-2 p-2 rounded-lg bg-white/60 border', compact && 'mx-2 mb-1.5 p-1.5')}
        style={{ borderColor: frameColors.primary + '30' }}
      >
        <div
          className={cn(
            'font-semibold uppercase tracking-wide mb-1.5 flex items-center justify-between',
            compact ? 'text-[9px]' : 'text-[10px]'
          )}
          style={{ color: frameColors.primary }}
        >
          <span>Required Habitat</span>
          {card.canRotate && (
            <span className="text-muted-foreground font-normal normal-case">
              Can rotate
            </span>
          )}
        </div>
        
        {/* Grid layout matching habitat pattern */}
        <div 
          className="inline-grid gap-1"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, rowIdx) => 
            row.map((cell, colIdx) => {
              if (!cell) {
                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={cn(compact ? 'w-5 h-5' : 'w-6 h-6')}
                  />
                );
              }
              
              return (
                <HabitatToken
                  key={`${rowIdx}-${colIdx}`}
                  cell={cell}
                  compact={compact}
                />
              );
            })
          )}
        </div>
        
        {/* Terrain legend */}
        <div className={cn('flex flex-wrap gap-1.5 mt-2', compact && 'gap-1 mt-1')}>
          {Array.from(new Set(card.habitat.map(h => h.terrain))).map(terrain => (
            <span 
              key={terrain} 
              className={cn('flex items-center gap-1', compact ? 'text-[8px]' : 'text-[9px]')}
            >
              <span 
                className="w-2.5 h-2.5 rounded-sm border border-black/20" 
                style={{ backgroundColor: terrainColors[terrain] }}
              />
              <span className="text-muted-foreground">{terrainNames[terrain]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Animals to Place Section */}
      <div 
        className={cn('px-3 py-2 border-t-2', compact && 'px-2 py-1.5')}
        style={{ 
          borderColor: frameColors.primary,
          backgroundColor: frameColors.primary + '15'
        }}
      >
        <div
          className={cn(
            'font-semibold uppercase tracking-wide mb-2 flex items-center gap-2',
            compact ? 'text-[9px] mb-1' : 'text-[10px]'
          )}
          style={{ color: frameColors.primary }}
        >
          <span>Animals to Place</span>
          <span className="text-muted-foreground font-normal">
            {remainingToPlace > 0 ? `${remainingToPlace} left` : 'All placed'}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 flex-wrap">
          {emojiSlots.map((slot) => (
            <PlaceableEmoji
              key={slot.index}
              emoji={card.emoji}
              isPlaced={slot.isPlaced}
              isSelected={slot.isSelected}
              onClick={() => onHabitatClick?.(slot.index)}
              isInteractive={isPlaceCubesPhase === true && inHand === true && !slot.isPlaced}
            />
          ))}
        </div>
      </div>
      
      {/* Click overlay for non-interactive mode (selecting cards, not placing) */}
      {onClick && !isPlaceCubesPhase && (
        <button
          onClick={onClick}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      )}
    </div>
  );
}
