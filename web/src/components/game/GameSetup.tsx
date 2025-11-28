import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GameSetupProps {
  onStartGame: (players: { name: string; color: string }[], soloMode: boolean) => void;
}

const PLAYER_COLORS = ['#2d5a3d', '#4a6fa5', '#8b5a2b', '#7a5c61'];

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(['Explorer']);
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    setPlayerNames(prev => {
      const newNames = [...prev];
      while (newNames.length < count) {
        newNames.push(`Player ${newNames.length + 1}`);
      }
      return newNames.slice(0, count);
    });
  };
  
  const handleNameChange = (index: number, name: string) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
  };
  
  const handleStart = () => {
    setIsLoading(true);
    const players = playerNames.map((name, i) => ({
      name: name || `Player ${i + 1}`,
      color: PLAYER_COLORS[i],
    }));
    
    setTimeout(() => {
      onStartGame(players, playerCount === 1);
    }, 300);
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-semibold text-3xl text-foreground mb-1">Wildscapes</h1>
          <p className="text-muted-foreground text-sm">Build landscapes and attract animals</p>
        </div>
        
        <div className="game-card p-5">
          <h2 className="font-semibold text-lg text-foreground mb-5 text-center">New Game</h2>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-foreground mb-2">Number of Players</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => handlePlayerCountChange(count)}
                  className={cn(
                    'flex-1 py-2.5 rounded-md font-medium text-sm transition-all',
                    playerCount === count
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-secondary'
                  )}
                >
                  {count === 1 ? 'Solo' : count}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2.5 mb-5">
            <label className="block text-sm font-medium text-foreground">Player Names</label>
            {playerNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PLAYER_COLORS[i] }}
                />
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                  className="flex-1 text-sm"
                />
              </div>
            ))}
          </div>
          
          <div className="bg-muted/50 rounded-md p-3 mb-5">
            <p className="text-xs text-muted-foreground">
              {playerCount === 1 ? (
                <>
                  <span className="font-medium text-foreground">Solo Mode:</span> Play with 3 token slots and 3 available animals. Build the highest-scoring landscape.
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">{playerCount} Players:</span> Take turns selecting tokens, building your landscape, and collecting animals.
                </>
              )}
            </p>
          </div>
          
          <Button onClick={handleStart} disabled={isLoading} className="w-full" size="default">
            {isLoading ? 'Starting...' : 'Start Game'}
          </Button>
        </div>
        
        <div className="mt-5 p-4 bg-card rounded-lg border border-border">
          <h3 className="font-semibold text-sm text-foreground mb-2">How to Play</h3>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Select 3 tokens from the central supply</li>
            <li>Place all tokens on your landscape board</li>
            <li>Take an animal card (optional, max 4 in hand)</li>
            <li>Place cubes when habitat patterns match</li>
            <li>Score points for terrain and completed animals</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
