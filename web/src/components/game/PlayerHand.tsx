import { AnimalCard as AnimalCardType, PlacedAnimalEmoji } from '@/types/game';
import { AnimalCard } from './AnimalCard';

interface PlayerHandProps {
  cards: AnimalCardType[];
  placedEmojis?: PlacedAnimalEmoji[];
  onCardSelect?: (cardId: string) => void;
  selectedCardId?: string | null;
  selectedHabitatIndex?: number | null;
  onHabitatClick?: (cardId: string, habitatIndex: number) => void;
  isPlaceCubesPhase?: boolean;
  maxCards?: number;
}

export function PlayerHand({ 
  cards, 
  placedEmojis = [],
  onCardSelect, 
  selectedCardId, 
  selectedHabitatIndex,
  onHabitatClick,
  isPlaceCubesPhase,
  maxCards = 4 
}: PlayerHandProps) {
  return (
    <div className="game-card p-3 font-sans">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-foreground">Your Hand</h3>
        <span className="text-xs text-muted-foreground">{cards.length}/{maxCards}</span>
      </div>
      {cards.length > 0 ? (
        <div className="flex flex-row flex-wrap gap-3 justify-center items-end w-full">
          {cards.map((card) => (
            <AnimalCard
              key={card.id}
              card={card}
              onClick={() => onCardSelect?.(card.id)}
              selected={selectedCardId === card.id}
              inHand
              placedEmojis={placedEmojis}
              selectedHabitatIndex={selectedCardId === card.id ? selectedHabitatIndex : null}
              onHabitatClick={(habitatIndex) => onHabitatClick?.(card.id, habitatIndex)}
              isPlaceCubesPhase={isPlaceCubesPhase}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-3">No cards in hand</p>
      )}
    </div>
  );
}
