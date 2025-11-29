import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';
import { Gamepad2, Star, TrendingUp, Users } from 'lucide-react';

export function PlayerStatsHeader() {
  const { currentPlayer, currentUser, openModal, getStatsForPlayer } = usePlayer();

  if (!currentPlayer || !currentUser) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground font-sans mb-4">
          Select a player to view stats
        </p>
        <Button onClick={openModal} className="font-sans">
          Select Player
        </Button>
      </div>
    );
  }

  // 🔑 Pull all game_stats rows for this player
  const games = getStatsForPlayer(currentPlayer.id);

  // Find this player's stats inside each game
  const perGameScores = games
    .map((game) =>
      game.players.find((p) => p.playerId === currentPlayer.id)?.finalScore ?? null
    )
    .filter((v): v is number => v !== null);

  const gamesPlayed = games.length;
  const highestScore =
    perGameScores.length > 0 ? Math.max(...perGameScores) : currentPlayer.highestScore ?? 0;
  const totalScore =
    perGameScores.length > 0
      ? perGameScores.reduce((sum, s) => sum + s, 0)
      : currentPlayer.totalPointsEarned ?? 0;
  const averageScore =
    perGameScores.length > 0 ? Math.round(totalScore / perGameScores.length) : 0;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
              {currentPlayer.avatarEmoji}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-sans">
                {currentPlayer.displayName}
              </h1>
              <p className="text-muted-foreground font-sans">
                @{currentUser.handle}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={openModal}
            className="font-sans"
          >
            <Users className="h-4 w-4 mr-2" />
            Switch Player
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border">
        <StatCard
          icon={<Gamepad2 className="h-5 w-5" />}
          label="Games Played"
          value={gamesPlayed}
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Highest Score"
          value={highestScore}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Score"
          value={averageScore}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subValue?: string;
}) {
  return (
    <div className="bg-card p-4 flex flex-col items-center text-center">
      <div className="text-muted-foreground mb-2">{icon}</div>
      <p className="text-2xl font-bold text-foreground font-sans">{value}</p>
      <p className="text-xs text-muted-foreground font-sans">{label}</p>
      {subValue && (
        <p className="text-xs text-primary font-sans mt-1">{subValue}</p>
      )}
    </div>
  );
}
