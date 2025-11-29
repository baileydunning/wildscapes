import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/context/PlayerContext';
import { PlayerPickerModal } from '@/components/player/PlayerPickerModal';
import { BarChart3, Loader2 } from 'lucide-react';
import type { Player, User } from '@/types/player';

interface GameSetupProps {
  // 🔑 include id so GameProvider can store dbPlayerId
  onStartGame: (
    players: { dbPlayerId: string; name: string; color: string }[],
    soloMode: boolean
  ) => void;
}

const FALLBACK_COLORS = ['#2d5a3d', '#4a6fa5', '#8b5a2b', '#7a5c61'];

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // One Player profile per seat
  const [seatPlayers, setSeatPlayers] = useState<(Player | null)[]>([null]);

  // Modal state for per-seat picking
  const [activeSeatIndex, setActiveSeatIndex] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const { currentPlayer, currentUser } = usePlayer();

  const primaryDisplayName =
    currentPlayer?.displayName ??
    currentUser?.displayName ??
    currentUser?.handle ??
    'Explorer';

  // Auto-seat the currentPlayer into seat 0 when it changes
  useEffect(() => {
    if (!currentPlayer) return;

    setSeatPlayers(prev => {
      const next = [...prev];
      const existing = next[0];

      if (!existing) {
        next[0] = {
          ...currentPlayer,
          displayName: primaryDisplayName,
        };
      }
      return next;
    });
  }, [currentPlayer, primaryDisplayName]);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setSeatPlayers(prev => {
      const next = [...prev];
      while (next.length < count) {
        next.push(null);
      }
      return next.slice(0, count);
    });
  };

  const openPickerForSeat = (index: number) => {
    setActiveSeatIndex(index);
    setIsPickerOpen(true);
  };

  const closePicker = () => {
    setActiveSeatIndex(null);
    setIsPickerOpen(false);
  };

  const handleSeatPlayerSelected = (player: Player, user: User) => {
    if (activeSeatIndex === null) return;

    setSeatPlayers(prev => {
      const next = [...prev];
      next[activeSeatIndex] = player;
      return next;
    });

    closePicker();
  };

  const handleStart = () => {
    setIsLoading(true);

    // 🔑 Pass through the real Harper Player.id per seat
    const players = Array.from({ length: playerCount }).map((_, i) => {
      const p = seatPlayers[i];
      return {
        id: p?.id ?? `local-player-${i + 1}`, // safety fallback; shouldn't hit because of allSeatsHaveProfiles
        name: p?.displayName || `Player ${i + 1}`,
        color: p?.colorTheme || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      };
    });

    onStartGame(players, playerCount === 1);
  };

  const allSeatsHaveProfiles = seatPlayers
    .slice(0, playerCount)
    .every(p => p !== null);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="bg-card/80 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg text-foreground tracking-tight">
          Wildscapes
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 sm:gap-2 rounded-full px-3 text-xs sm:text-sm"
          >
            <Link to="/stats">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="font-semibold text-3xl text-foreground mb-1 tracking-tight">
              Wildscapes
            </h1>
            <p className="text-muted-foreground text-sm">
              Build landscapes and attract animals
            </p>
          </div>

          <div className="game-card p-5 rounded-2xl border border-border bg-card/80 shadow-sm">
            <h2 className="font-semibold text-lg text-foreground mb-5 text-center">
              New Game
            </h2>

            {/* Player count */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-2">
                Number of players
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(count => {
                  const isActive = playerCount === count;
                  return (
                    <Button
                      key={count}
                      type="button"
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePlayerCountChange(count)}
                      className={cn(
                        'flex-1 justify-center rounded-full text-xs sm:text-sm font-medium',
                        'border-muted-foreground/10',
                        isActive &&
                          'shadow-sm ring-2 ring-primary/30 ring-offset-1 ring-offset-background'
                      )}
                    >
                      {count === 1 ? 'Solo' : count}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Seats / profiles */}
            <div className="space-y-2.5 mb-5">
              <label className="block text-sm font-medium text-foreground">
                Players
              </label>
              {Array.from({ length: playerCount }).map((_, i) => {
                const p = seatPlayers[i];

                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-2"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ backgroundColor: p?.colorTheme || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
                    >
                      {p ? p.avatarEmoji : i + 1}
                    </div>
                    <div className="flex-1 flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1">
                          {p ? (
                            <>
                              <span>{p.displayName}</span>
                            </>
                          ) : (
                            <>Choose player {i + 1}</>
                          )}
                        </span>
                        {i === 0 && currentPlayer && (
                          <span className="text-[11px] text-muted-foreground">
                            (You)
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant={p ? 'outline' : 'secondary'}
                        size="sm"
                        className="rounded-full px-3 py-1 text-[11px] font-medium"
                        onClick={() => openPickerForSeat(i)}
                      >
                        {p ? 'Change' : 'Select'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-muted/60 rounded-xl p-3 mb-5 border border-border/40">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {playerCount === 1 ? (
                  <>
                    <span className="font-medium text-foreground">Solo mode:</span> Play
                    with 3 token slots and 3 available animals. Build the highest-scoring
                    landscape.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-foreground">
                      {playerCount} players:
                    </span>{' '}
                    Take turns selecting tokens, building your landscape, and collecting
                    animals.
                  </>
                )}
              </p>
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading || !allSeatsHaveProfiles}
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
              size="default"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting…
                </span>
              ) : (
                'Start game'
              )}
            </Button>
          </div>

          <div className="mt-5 p-4 bg-card/80 rounded-xl border border-border">
            <h3 className="font-semibold text-sm text-foreground mb-2">How to play</h3>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>Select 3 tokens from the central supply</li>
              <li>Place all tokens on your landscape board</li>
              <li>Take an animal card (optional, max 4 in hand)</li>
              <li>Place cubes when habitat patterns match</li>
              <li>Score points for terrain and completed animals</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Seat-based picker usage of the same modal */}
      <PlayerPickerModal
        isOpen={isPickerOpen}
        onClose={closePicker}
        onSelectPlayer={handleSeatPlayerSelected}
      />
    </div>
  );
}
