import { usePlayer } from '@/context/PlayerContext';
import {
  BarChart3,
  TrendingUp,
  Target,
  Leaf,
  Droplets,
  Mountain,
} from 'lucide-react';
import type { ReactNode } from 'react';

export function AggregateStats() {
  const { currentPlayer, getStatsForPlayer } = usePlayer();

  if (!currentPlayer) return null;

  // Be safe if getStatsForPlayer returns undefined/null
  const games = getStatsForPlayer(currentPlayer.id) ?? [];

  if (games.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground font-sans">
          Play some games to see aggregate statistics
        </p>
      </div>
    );
  }

  // Only keep stats entries where this player appears
  const playerGames = games
    .map(game => game.players.find(p => p.playerId === currentPlayer.id) || null)
    .filter((p): p is NonNullable<typeof p> => p !== null);

  if (playerGames.length === 0) {
    // No entries for this player in the returned games
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground font-sans">
          No recorded stats for this player yet
        </p>
      </div>
    );
  }

  // Aggregate per-player stats from GameStats
  const totalScoreFromGames = playerGames.reduce(
    (sum, g) => sum + g.finalScore,
    0
  );
  const avgScoreFromGames = Math.round(totalScoreFromGames / playerGames.length);

  const avgTurns = Math.round(
    playerGames.reduce((sum, g) => sum + g.turnsTaken, 0) / playerGames.length
  );

  const totalAnimals = playerGames.reduce(
    (sum, g) => sum + g.animalsCompleted,
    0
  );
  const avgAnimals = (totalAnimals / playerGames.length).toFixed(1);

  // Lifetime totals from Player model
  const lifetimePoints = currentPlayer.totalPointsEarned ?? 0;
  const lifetimeAvgScore =
    currentPlayer.totalGamesPlayed > 0
      ? Math.round(lifetimePoints / currentPlayer.totalGamesPlayed)
      : 0;

  // Habitat breakdown from animal stats
  const habitatTotals: Record<string, number> = {};
  games.forEach(game => {
    Object.entries(game.animals.habitatBreakdown).forEach(
      ([habitat, count]) => {
        habitatTotals[habitat] = (habitatTotals[habitat] || 0) + count;
      }
    );
  });

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground font-sans flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Aggregate Statistics
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          <StatBlock
            label="Avg Score (Recent)"
            value={avgScoreFromGames}
            icon={<Target className="h-4 w-4" />}
          />
          <StatBlock
            label="Avg Turns"
            value={avgTurns}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatBlock
            label="Avg Animals"
            value={avgAnimals}
            icon={<Leaf className="h-4 w-4" />}
          />
          <StatBlock
            label="Lifetime Points"
            value={lifetimePoints}
            icon={<Target className="h-4 w-4" />}
            subValue={`~${lifetimeAvgScore} avg`}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-medium text-muted-foreground font-sans mb-3">
          Habitat Completions
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(habitatTotals).map(([habitat, count]) => (
            <div
              key={habitat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50"
            >
              <HabitatIcon habitat={habitat} />
              <span className="text-sm font-medium font-sans capitalize">
                {habitat}
              </span>
              <span className="text-sm text-muted-foreground font-sans">
                {count}
              </span>
            </div>
          ))}
          {Object.keys(habitatTotals).length === 0 && (
            <p className="text-xs text-muted-foreground font-sans">
              No habitat completions recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  icon,
  subValue,
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  subValue?: string;
}) {
  return (
    <div className="bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-sans">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground font-sans">{value}</p>
      {subValue && (
        <p className="text-[11px] text-primary font-sans mt-1">{subValue}</p>
      )}
    </div>
  );
}

function HabitatIcon({ habitat }: { habitat: string }) {
  switch (habitat.toLowerCase()) {
    case 'forest':
      return <Leaf className="h-4 w-4 text-terrain-treetop" />;
    case 'water':
      return <Droplets className="h-4 w-4 text-terrain-water" />;
    case 'mountain':
      return <Mountain className="h-4 w-4 text-terrain-mountain" />;
    default:
      return <Leaf className="h-4 w-4 text-terrain-field" />;
  }
}
