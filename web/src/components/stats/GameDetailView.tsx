import { GameStats } from '@/types/player';
import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  Layers,
  Grid3X3,
  Leaf,
  Mountain,
  Droplets,
  Zap,
  Wheat,
  House,
} from 'lucide-react';
import { format } from 'date-fns';

interface GameDetailViewProps {
  game: GameStats;
  onBack: () => void;
}

export function GameDetailView({ game, onBack }: GameDetailViewProps) {
  const { currentPlayer } = usePlayer();
  const playerStats = game.players.find(
    p => p.playerId === currentPlayer?.id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="font-sans"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Games
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground font-sans">
            Game Details
          </h1>
          <p className="text-sm text-muted-foreground font-sans">
            {format(new Date(game.createdAt), 'MMMM d, yyyy • h:mm a')} •{' '}
            {game.mode}
          </p>
        </div>
      </div>

      {playerStats && <PlayerGameSummary playerStats={playerStats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BoardStatsSection board={game.board} />
        <AnimalStatsSection animals={game.animals} />
      </div>

      <OverallStatsSection
        overall={game.overall}
        players={game.players}
      />
    </div>
  );
}

function PlayerGameSummary({
  playerStats,
}: {
  playerStats: GameStats['players'][0];
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        playerStats.isWinner
          ? 'bg-primary/5 border-primary/20'
          : 'bg-card border-border'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            playerStats.isWinner
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {playerStats.isWinner ? (
            <Trophy className="h-6 w-6" />
          ) : (
            <span className="text-xl font-bold font-sans">
              #{playerStats.rank}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p
            className={`font-semibold font-sans ${
              playerStats.isWinner ? 'text-primary' : 'text-foreground'
            }`}
          >
            {playerStats.isWinner
              ? 'Victory!'
              : `Finished #${playerStats.rank}`}
          </p>
          <p className="text-sm text-muted-foreground font-sans">
            {playerStats.playerName}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground font-sans">
              {playerStats.finalScore}
            </p>
            <p className="text-xs text-muted-foreground font-sans">
              Score
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-sans">
              {playerStats.turnsTaken}
            </p>
            <p className="text-xs text-muted-foreground font-sans">
              Turns
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground font-sans">
              {playerStats.animalsCompleted}
            </p>
            <p className="text-xs text-muted-foreground font-sans">
              Animals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardStatsSection({
  board,
}: {
  board: GameStats['board'];
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground font-sans flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Board Statistics
        </h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            label="Tokens Placed"
            value={board.totalTokensPlaced}
            icon={<Layers className="h-4 w-4" />}
          />
          <StatItem
            label="Coverage"
            value={`${board.coveragePercent}%`}
            icon={<Grid3X3 className="h-4 w-4" />}
          />
          <StatItem
            label="Avg Stack Height"
            value={board.averageStackHeight.toFixed(1)}
            icon={<Layers className="h-4 w-4" />}
          />
          <StatItem
            label="Max Stack Height"
            value={board.maxStackHeight}
            icon={<Layers className="h-4 w-4" />}
          />
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground font-sans mb-2">
            Tokens by Type
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(board.tokensByType).map(
              ([type, count]) => (
                <TokenBadge key={type} type={type} count={count} />
              )
            )}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground font-sans mb-2">
            Terrain Groups
          </p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm terrain-field" />
              <span className="font-sans">
                Field: {board.largestFieldGroup}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm terrain-mountain" />
              <span className="font-sans">
                Mountain: {board.largestMountainGroup}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm terrain-water" />
              <span className="font-sans">
                River: {board.largestRiverGroup}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground font-sans">
              Isolated Tiles:{' '}
            </span>
            <span className="font-medium font-sans">
              {board.isolatedTiles}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground font-sans">
              Unused Tiles:{' '}
            </span>
            <span className="font-medium font-sans">
              {board.unusedTiles}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground font-sans">
              Most Common:{' '}
            </span>
            <span className="font-medium font-sans capitalize">
              {board.mostCommonTerrain}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground font-sans">
              Least Common:{' '}
            </span>
            <span className="font-medium font-sans capitalize">
              {board.leastCommonTerrain}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimalStatsSection({
  animals,
}: {
  animals: GameStats['animals'];
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground font-sans flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Animal Statistics
        </h2>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatItem
            label="Collected"
            value={animals.totalCollected}
            icon={<Target className="h-4 w-4" />}
          />
          <StatItem
            label="Completed"
            value={animals.totalCompleted}
            icon={<Trophy className="h-4 w-4" />}
          />
          <StatItem
            label="Partial"
            value={animals.totalPartial}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatItem
            label="Points"
            value={animals.totalPoints}
            icon={<Zap className="h-4 w-4" />}
          />
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground font-sans mb-2">
            Performance
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground font-sans">
                Diversity Score:{' '}
              </span>
              <span className="font-medium font-sans">
                {(animals.diversityScore * 100).toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground font-sans">
                Avg Cubes/Animal:{' '}
              </span>
              <span className="font-medium font-sans">
                {animals.averageCubesPerAnimal.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {animals.mostValuableAnimal && (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium text-muted-foreground font-sans mb-2">
              Most Valuable Animal
            </p>
            <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-medium text-primary font-sans">
                {animals.mostValuableAnimal}
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground font-sans mb-2">
            Habitat Breakdown
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(animals.habitatBreakdown).map(
              ([habitat, count]) => (
                <div
                  key={habitat}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 text-sm"
                >
                  <HabitatIcon habitat={habitat} />
                  <span className="font-sans capitalize">{habitat}</span>
                  <span className="font-medium font-sans">
                    {count}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OverallStatsSection({
  overall,
  players,
}: {
  overall: GameStats['overall'];
  players: GameStats['players'];
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground font-sans flex items-center gap-2">
          <Target className="h-5 w-5" />
          Overall Game Statistics
        </h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatItem
            label="Final Score"
            value={overall.finalScore}
            icon={<Trophy className="h-4 w-4" />}
          />
          <StatItem
            label="Environment Pts"
            value={overall.environmentPoints}
            icon={<Mountain className="h-4 w-4" />}
          />
          <StatItem
            label="Animal Pts"
            value={overall.animalPoints}
            icon={<Leaf className="h-4 w-4" />}
          />
          <StatItem
            label="Turns Taken"
            value={overall.turnsTaken}
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border pt-4">
          <StatItem
            label="Total Actions"
            value={overall.totalActions}
            icon={<Zap className="h-4 w-4" />}
          />
          <StatItem
            label="Skipped Actions"
            value={overall.skippedActions}
            icon={<Clock className="h-4 w-4" />}
          />
          <StatItem
            label="Players"
            value={overall.playerCount}
            icon={<Target className="h-4 w-4" />}
          />
          <StatItem
            label="Avg Score"
            value={overall.averageScorePerPlayer}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>

        {players.length > 1 && (
          <div className="border-t border-border pt-4 mt-4">
            <p className="text-sm font-medium text-muted-foreground font-sans mb-2">
              All Players
            </p>
            <div className="space-y-2">
              {players
                .slice()
                .sort((a, b) => a.rank - b.rank)
                .map(p => (
                  <div
                    key={p.playerId}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-sans ${
                        p.isWinner
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {p.rank}
                    </span>
                    <span className="flex-1 font-sans">
                      {p.playerName}
                    </span>
                    <span className="font-medium font-sans">
                      {p.finalScore}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-lg font-bold text-foreground font-sans">
          {value}
        </p>
        <p className="text-xs text-muted-foreground font-sans">
          {label}
        </p>
      </div>
    </div>
  );
}

function TokenBadge({
  type,
  count,
}: {
  type: string;
  count: number;
}) {
  const terrainClass = `terrain-${type}`;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 text-sm">
      <div className={`w-3 h-3 rounded-sm ${terrainClass}`} />
      <span className="font-sans capitalize">{type}</span>
      <span className="font-medium font-sans">{count}</span>
    </div>
  );
}

function HabitatIcon({ habitat }: { habitat: string }) {
  switch (habitat.toLowerCase()) {
    case 'forest':
      return (
        <Leaf className="h-3.5 w-3.5 text-terrain-treetop" />
      );
    case 'water':
      return (
        <Droplets className="h-3.5 w-3.5 text-terrain-water" />
      );
    case 'mountain':
      return (
        <Mountain className="h-3.5 w-3.5 text-terrain-mountain" />
      );
    case 'field':
      return (
        <Wheat className="h-3.5 w-3.5 text-terrain-field" />
      );
    case 'building':
      return (
        <House className="h-3.5 w-3.5 text-terrain-building" />
      );
    default:
      return (
        <Leaf className="h-3.5 w-3.5 text-terrain-field" />
      );
  }
}

function TrendingUp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
