import { Button } from '@/components/ui/button';

interface GameControlsProps {
  turnPhase: string;
  tokensToPlaceCount: number;
  onEndTurn: () => void;
  onSkipTakeCard?: () => void;
  canEndTurn: boolean;
  canSkipTakeCard?: boolean;
}

export function GameControls({
  turnPhase,
  tokensToPlaceCount,
  onEndTurn,
  onSkipTakeCard,
  canEndTurn,
  canSkipTakeCard,
}: GameControlsProps) {
  return (
    <div className="game-card p-3 font-sans">
      <h3 className="font-semibold text-sm text-foreground mb-2">Turn Progress</h3>
      
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${turnPhase === 'selectSlot' ? 'bg-primary' : 'bg-muted'}`} />
          <span className={turnPhase === 'selectSlot' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            1. Select tokens
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${turnPhase === 'placeTokens' ? 'bg-primary' : 'bg-muted'}`} />
          <span className={turnPhase === 'placeTokens' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            2. Place tokens {tokensToPlaceCount > 0 && `(${tokensToPlaceCount})`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${turnPhase === 'takeCard' ? 'bg-primary' : 'bg-muted'}`} />
          <span className={turnPhase === 'takeCard' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            3. Take card (opt.)
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${turnPhase === 'placeCubes' ? 'bg-primary' : 'bg-muted'}`} />
          <span className={turnPhase === 'placeCubes' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
            4. Place cubes (opt.)
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        {canSkipTakeCard && onSkipTakeCard && (
          <Button variant="outline" size="sm" onClick={onSkipTakeCard} className="w-full text-xs">
            Skip Taking Card
          </Button>
        )}
        <Button onClick={onEndTurn} disabled={!canEndTurn} className="w-full text-xs" size="sm">
          End Turn
        </Button>
      </div>
    </div>
  );
}
