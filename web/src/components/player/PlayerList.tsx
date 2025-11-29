import { Player, User } from '@/types/player';
import { usePlayer } from '@/context/PlayerContext';
import { Gamepad2, Star } from 'lucide-react';

interface PlayerListProps {
  user: User;
  onSelectPlayer: (player: Player) => void;
  onBack: () => void;
}

export function PlayerList({ user, onSelectPlayer, onBack }: PlayerListProps) {
  const { getPlayersForUser } = usePlayer();
  const players = getPlayersForUser(user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
        >
          ← Back
        </button>
        <div>
          <p className="font-medium text-foreground font-sans">{user.displayName}</p>
          <p className="text-xs text-muted-foreground font-sans">@{user.handle}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground font-sans">
          Select a Player Profile
        </p>
        
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 font-sans">
            No player profiles found
          </p>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => onSelectPlayer(player)}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/30 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {player.avatarEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground font-sans">
                    {player.displayName}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                      <Gamepad2 className="h-3 w-3" />
                      {player.totalGamesPlayed} games
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                      <Star className="h-3 w-3" />
                      {player.highestScore} best
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
