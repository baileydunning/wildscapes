import { TokenSlot } from '@/types/game';
import { TerrainToken } from './TerrainToken';
import { cn } from '@/lib/utils';

interface CentralBoardProps {
  slots: TokenSlot[];
  onSlotSelect: (slotId: number) => void;
  selectedSlotId: number | null;
  disabled?: boolean;
}

export function CentralBoard({ slots, onSlotSelect, selectedSlotId, disabled }: CentralBoardProps) {
  return (
    <div className="game-card p-3">
      <h3 className="font-semibold text-sm text-foreground mb-2 font-sans">Token Supply</h3>
      <div className="space-y-1.5">
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => onSlotSelect(slot.id)}
            disabled={disabled || slot.tokens.length === 0}
            className={cn(
              'w-full p-2.5 rounded-md bg-slot flex items-center justify-center gap-2.5 transition-all duration-150 border border-transparent font-sans',
              selectedSlotId === slot.id && 'border-primary bg-primary/5',
              !disabled && slot.tokens.length > 0 && 'hover:bg-primary/10 hover:border-primary/40',
              (disabled || slot.tokens.length === 0) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {slot.tokens.length > 0 ? (
              slot.tokens.map((token) => (
                <TerrainToken key={token.id} type={token.type} size="md" asDiv />
              ))
            ) : (
              <span className="text-xs text-muted-foreground py-1">Empty</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
