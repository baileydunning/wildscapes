import { GameProvider } from '@/context/GameContext';
import { WildscapesGame } from '@/components/game/WildscapesGame';

const Index = () => {
  return (
    <GameProvider>
      <WildscapesGame />
    </GameProvider>
  );
};

export default Index;
