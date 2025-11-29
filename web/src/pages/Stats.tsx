import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayerStatsHeader } from '@/components/stats/PlayerStatsHeader';
import { GameList } from '@/components/stats/GameList';
import { AggregateStats } from '@/components/stats/AggregateStats';
import { GameDetailView } from '@/components/stats/GameDetailView';
import { PlayerPickerModal } from '@/components/player/PlayerPickerModal';
import { GameStats } from '@/types/player';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Stats() {
  const [selectedGame, setSelectedGame] = useState<GameStats | null>(null);

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-5xl mx-auto px-4 py-6">
          <GameDetailView
            game={selectedGame}
            onBack={() => setSelectedGame(null)}
          />
        </div>
        <PlayerPickerModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="font-sans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Game
            </Button>
          </Link>
          <Link to="/stats">
            <h1 className="text-2xl font-bold text-foreground font-sans">
              Player Stats
            </h1>
          </Link>
        </div>

        <PlayerStatsHeader />
        <AggregateStats />
        <GameList onSelectGame={setSelectedGame} />
      </div>
      <PlayerPickerModal />
    </div>
  );
}
