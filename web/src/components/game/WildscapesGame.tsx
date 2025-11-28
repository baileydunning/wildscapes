import { useGame } from '@/context/GameContext';
import { GameSetup } from './GameSetup';
import { GameBoard } from './GameBoard';
import { GameOver } from './GameOver';

export function WildscapesGame() {
  const { state, startGame } = useGame();
  
  const handlePlayAgain = () => {
    window.location.reload();
  };
  
  if (state.phase === 'setup') {
    return <GameSetup onStartGame={startGame} />;
  }
  
  if (state.phase === 'ended') {
    return <GameOver players={state.players} onPlayAgain={handlePlayAgain} />;
  }
  
  return <GameBoard />;
}
