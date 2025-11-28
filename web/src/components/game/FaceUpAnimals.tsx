import { AnimalCard as AnimalCardType } from '@/types/game';
import { AnimalCard } from './AnimalCard';

interface FaceUpAnimalsProps {
  cards: AnimalCardType[];
  onCardTake: (cardId: string) => void;
  canTake: boolean;
}

export function FaceUpAnimals({ cards, onCardTake, canTake }: FaceUpAnimalsProps) {
  return (
    <div className="game-card p-3 font-sans">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-foreground">Available Animals</h3>
        <span className="text-xs text-muted-foreground">{cards.length}</span>
      </div>
      <div
        className="flex flex-row flex-wrap gap-3 justify-center items-end w-full"
      >
        {cards.map((card) => (
          <AnimalCard
            key={card.id}
            card={card}
            onClick={() => onCardTake(card.id)}
            disabled={!canTake}
            compact
          />
        ))}
      </div>
      {cards.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-3">No cards available</p>
      )}
    </div>
  );
}
