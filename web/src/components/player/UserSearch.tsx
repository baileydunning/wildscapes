import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { User } from '@/types/player';

interface UserSearchProps {
  onSelectUser: (user: User) => void;
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
  const { searchUsers, getPlayersForUser } = usePlayer();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);

  useEffect(() => {
    const filtered = searchUsers(query);
    setResults(filtered);
  }, [query, searchUsers]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or @handle..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 font-sans"
        />
      </div>
      
      <div className="max-h-[280px] overflow-y-auto space-y-1">
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 font-sans">
            No users found
          </p>
        ) : (
          results.map((user) => {
            const players = getPlayersForUser(user.id);
            const avatarEmoji = players.length > 0 ? players[0].avatarEmoji : user.displayName.charAt(0).toUpperCase();
            return (
              <button
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {avatarEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate font-sans">
                    {user.displayName}
                  </p>
                  <p className="text-sm text-muted-foreground font-sans">
                    @{user.handle}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
