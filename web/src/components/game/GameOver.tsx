import { PlayerState } from '@/types/game';
import { calculateEnvironmentScore } from '@/lib/environmentScoring';
import {
  scoreTrees,
  scoreMountains,
  scoreFields,
  scoreBuildings,
  scoreRivers,
} from '@/lib/environmentScoring';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameOverProps {
  players: PlayerState[];
  onPlayAgain: () => void;
}

export function GameOver({ players, onPlayAgain }: GameOverProps) {
  // Calculate environment scores and total scores for each player
  const scoredPlayers = players.map(player => {
    const trees = scoreTrees(player.board);
    const mountains = scoreMountains(player.board);
    const fields = scoreFields(player.board);
    // Buildings: use same logic as scoreBuildings (base can be trunk, mountain, or red, roof is red above base)
    const baseTypes = ['trunk', 'red', 'mountain'];
    const buildings = player.board.filter(t => {
      if (t.token.type !== 'building' || t.stackLevel < 1) return false;
      // Must have a base token below roof
      return player.board.some(b => b.position.q === t.position.q && b.position.r === t.position.r && baseTypes.includes(b.token.type) && b.stackLevel < t.stackLevel);
    }).length * 2;
    const rivers = scoreRivers(player.board);
    const envScore = trees + mountains + fields + buildings + rivers;
    return {
      ...player,
      envScore,
      totalScore: player.score + envScore,
      envBreakdown: { trees, mountains, fields, buildings, rivers },
    };
  });
  const sortedPlayers = [...scoredPlayers].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sortedPlayers[0];
  
  const getRating = (score: number) => {
    if (score >= 80) return { letter: 'S', label: 'Legendary' };
    if (score >= 60) return { letter: 'A', label: 'Excellent' };
    if (score >= 40) return { letter: 'B', label: 'Great' };
    if (score >= 20) return { letter: 'C', label: 'Good' };
    return { letter: 'D', label: 'Keep trying' };
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <h1 className="font-semibold text-2xl text-foreground mb-1">
            {players.length === 1 ? 'Game Complete' : `${winner.name} Wins`}
          </h1>
          <p className="text-muted-foreground text-sm">
            {players.length === 1 ? 'See your final score' : 'Final standings'}
          </p>
        </div>
        
        <div className="game-card p-5 mb-5">
          <h2 className="font-semibold text-base text-foreground mb-4">Final Scores</h2>
          
          <div className="space-y-2">
            {sortedPlayers.map((player, i) => (
              <div
                key={player.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-md transition-all',
                  i === 0 ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                )}
              >
                <span className="text-sm font-bold text-muted-foreground w-6">
                  #{i + 1}
                </span>
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: player.color }}
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm text-foreground">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.completedCards.length} animals, {player.board.length} tokens
                  </p>
                  <div className="text-xs text-green-700">
                    <div>Environment: {player.envScore} pts</div>
                    <div className="pl-2 text-xs text-muted-foreground">
                      <div>Trees: {player.envBreakdown.trees}</div>
                      <div>Mountains: {player.envBreakdown.mountains}</div>
                      <div>Fields: {player.envBreakdown.fields} (5 pts per group of 2)</div>
                      <div>Buildings: {player.envBreakdown.buildings}</div>
                      <div>Rivers: {player.envBreakdown.rivers} (see rules for scoring)</div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700">Animal Cards: {player.score} pts</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">{player.totalScore}</p>
                  <p className="text-xs text-muted-foreground">total pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {scoredPlayers.length === 1 && (
          <div className="game-card p-4 mb-5">
            <p className="text-xs text-muted-foreground mb-2">Your Rating</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-primary">
                {getRating(winner.totalScore).letter}
              </span>
              <span className="text-sm text-muted-foreground">
                {getRating(winner.totalScore).label}
              </span>
            </div>
          </div>
        )}
        
        <div className="game-card p-4 mb-5 text-left">
          <h3 className="font-semibold text-xs text-foreground mb-2">Scoring Summary</h3>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            <li>Trees: Each stack ending with a Tree Top scores by height: 1 (just Tree Top), 3 (Trunk+Tree Top), 7 (Trunk+Trunk+Tree Top).</li>
            <li>Mountains: Each range of orthogonally adjacent mountains of the same height scores 1/3/6 per mountain (height 1/2/3).</li>
            <li>Fields: Each group of 2 orthogonally connected yellow field tiles counts as 1 field worth 5 points. Multiple separate groups score separately (e.g., two groups of 2 = 10 points).</li>
            <li>Buildings: Each stack of 2 (base + red roof) scores 2 points. Adjacency does not matter.</li>
            <li>Water: Each river scores:<br />
              &nbsp;&nbsp;• Length 1: 0 points<br />
              &nbsp;&nbsp;• Length 2: 2 points<br />
              &nbsp;&nbsp;• Length 3: 5 points<br />
              &nbsp;&nbsp;• Length 4: 8 points<br />
              &nbsp;&nbsp;• Length 5: 11 points<br />
              &nbsp;&nbsp;• Length 6: 15 points<br />
              &nbsp;&nbsp;• Length 7+: 15 + 4 points for each additional tile<br />
            </li>
            <li>Animals: Card point value for completed animal cards.</li>
          </ul>
        </div>
        
        <Button onClick={onPlayAgain} className="w-full">
          Play Again
        </Button>
      </div>
    </div>
  );
}
