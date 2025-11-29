import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlayerState } from '@/types/game';
import { cn } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';

type ScoreBreakdownItem = {
  label: string;
  value: number;
};

// Returns a score breakdown for a player using real data
function getScoreBreakdown(player: PlayerState): ScoreBreakdownItem[] {
  // Example assumes player.completedCards and player.environmentScoreBreakdown exist
  const animalScore =
    player.completedCards?.reduce(
      (sum, card) => sum + (card.points ?? 0),
      0
    ) ?? 0;

  const environmentBreakdown: Record<string, number> =
    player.environmentScoreBreakdown ?? {};

  const environmentTotal = Object.values(environmentBreakdown).reduce(
    (sum, v) => sum + v,
    0
  );

  return [
    { label: 'Animal Cards', value: animalScore },
    ...Object.entries(environmentBreakdown).map(([label, value]) => ({
      label,
      value,
    })),
    { label: 'Environment Total', value: environmentTotal },
    { label: 'Grand Total', value: animalScore + environmentTotal },
  ];
}

interface GameHeaderProps {
  players: PlayerState[];
  currentPlayerIndex: number;
  roundNumber: number;
  turnPhase: string;
  tokensRemaining: number;
}

const phaseLabels: Record<string, string> = {
  selectSlot: 'Select tokens',
  placeTokens: 'Place tokens',
  takeCard: 'Take card (opt.)',
  placeCubes: 'Place cubes (opt.)',
};

export function GameHeader({
  players,
  currentPlayerIndex,
  roundNumber,
  turnPhase,
  tokensRemaining,
}: Readonly<GameHeaderProps>) {
  // If PlayerState['id'] is not a string, adjust this type accordingly
  const [openPlayerId, setOpenPlayerId] = useState<PlayerState['id'] | null>(null);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 font-sans">
      <div className="container mx-auto px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Game title / round */}
          <div>
            <h1 className="font-semibold text-lg text-foreground">Wildscapes</h1>
            <p className="text-xs text-muted-foreground">Round {roundNumber}</p>
          </div>

          {/* Phase label */}
          <div className="hidden sm:block px-3 py-1 bg-primary/10 rounded">
            <p className="text-xs font-medium text-primary">
              {phaseLabels[turnPhase] || turnPhase}
            </p>
          </div>

          {/* Player pills with score dialog */}
          <div className="flex items-center gap-2">
            {players.map((player, i) => (
              <Dialog
                key={player.id}
                open={openPlayerId === player.id}
                onOpenChange={(open) =>
                  setOpenPlayerId(open ? player.id : null)
                }
              >
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded transition-all cursor-pointer',
                      i === currentPlayerIndex
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-muted/50'
                    )}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: player.color }}
                    />
                    <span
                      className={cn(
                        'text-xs font-medium',
                        i === currentPlayerIndex
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {player.name}
                    </span>
                    <span className="text-xs text-muted-foreground underline">
                      {player.score}
                    </span>
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-base">
                      Score Breakdown: {player.name}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mt-2 space-y-2">
                    {getScoreBreakdown(player).map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between text-sm"
                      >
                        <span className="font-medium text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-bold text-foreground">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-xs text-muted-foreground space-y-1">
                    <div>Animal Cards: points from completed animal cards.</div>
                    <div>
                      Environment: points from trees, mountain ranges, field
                      regions, building groups, and rivers.
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>

          {/* Right side: bag, stats link, player header */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground">Bag: {tokensRemaining}</p>
            <Link
              to="/stats"
              className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="View Stats"
            >
              <BarChart3 className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
