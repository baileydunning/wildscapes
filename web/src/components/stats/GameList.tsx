import { usePlayer } from '@/context/PlayerContext';
import { GameStats, PlayerGameStats } from '@/types/player';
import {
  Trophy,
  Clock,
  Target,
  Users,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

interface GameListProps {
  onSelectGame: (game: GameStats) => void;
}

export function GameList({ onSelectGame }: GameListProps) {
  const { currentPlayer, getStatsForPlayer } = usePlayer();

  if (!currentPlayer) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground font-sans">
          Select a player to view game history
        </p>
      </div>
    );
  }

  const games = getStatsForPlayer(currentPlayer.id);

  if (games.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground font-sans">
          No games played yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground font-sans">
          Recent Games
        </h2>
      </div>
      <div className="divide-y divide-border">
        {games.map(game => {
          const playerStats = game.players.find(
            p => p.playerId === currentPlayer.id
          );
          if (!playerStats) return null;

          return (
            <GameRow
              key={game.id}
              game={game}
              playerStats={playerStats}
              onClick={() => onSelectGame(game)}
            />
          );
        })}
      </div>
    </div>
  );
}

function GameRow({
  game,
  playerStats,
  onClick,
}: {
  game: GameStats;
  playerStats: PlayerGameStats;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          playerStats.isWinner
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {playerStats.isWinner ? (
          <Trophy className="h-5 w-5" />
        ) : (
          <span className="font-bold font-sans">
            #{playerStats.rank}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium font-sans ${
              playerStats.isWinner ? 'text-primary' : 'text-foreground'
            }`}
          >
            {playerStats.isWinner
              ? 'Victory'
              : `Rank #${playerStats.rank}`}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-sans">
            {game.mode}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-sans mt-0.5">
          {format(new Date(game.createdAt), 'MMM d, yyyy • h:mm a')}
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Target className="h-4 w-4" />
          <span className="font-medium text-foreground font-sans">
            {playerStats.finalScore}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="font-sans">{playerStats.turnsTaken}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="font-sans">
            {game.overall.playerCount}
          </span>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
