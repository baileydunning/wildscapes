import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { HexPosition } from '@/types/game';
import { GameHeader } from './GameHeader';
import { CentralBoard } from './CentralBoard';
import { HexGrid } from './HexGrid';
import { TokensToPlace } from './TokensToPlace';
import { FaceUpAnimals } from './FaceUpAnimals';
import { PlayerHand } from './PlayerHand';
import { GameControls } from './GameControls';
import { RulesReference } from './RulesReference';
import { toast } from '@/hooks/use-toast';

export function GameBoard() {
  const { 
    state, 
    selectSlot, 
    placeToken, 
    takeAnimalCard, 
    skipTakeCard, 
    skipPlaceCubes, 
    endTurn,
    selectHabitatCell,
    placeAnimalEmoji
  } = useGame();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  
  const currentPlayer = state.players[state.currentPlayerIndex];
  const canTakeAnimalCard = currentPlayer.handCards.length < 4 && state.turnPhase === 'takeCard';
  const canEndTurn = state.turnPhase === 'placeCubes';
  const isPlacingEmoji = state.turnPhase === 'placeCubes' && state.selectedHabitatIndex !== null;
  
  const handleSlotSelect = (slotId: number) => {
    if (state.turnPhase !== 'selectSlot') {
      toast({ title: "Cannot select slot", description: "Select a slot at the start of your turn.", variant: "destructive" });
      return;
    }
    selectSlot(slotId);
    setSelectedTokenIndex(0);
  };
  
  const handleHexClick = (position: HexPosition) => {
    // If placing an emoji
    if (isPlacingEmoji) {
      placeAnimalEmoji(position);
      return;
    }
    
    // If placing tokens
    if (state.turnPhase !== 'placeTokens') return;
    if (selectedTokenIndex === null) {
      toast({ title: "Select a token", description: "Click a token below first." });
      return;
    }
    placeToken(position, selectedTokenIndex);
    if (state.tokensToPlace.length > 1) setSelectedTokenIndex(0);
    else setSelectedTokenIndex(null);
  };
  
  const handleTakeAnimalCard = (cardId: string) => {
    if (!canTakeAnimalCard) {
      toast({ title: "Cannot take card", description: "Place all tokens first or hand is full.", variant: "destructive" });
      return;
    }
    takeAnimalCard(cardId);
  };
  
  const handleSkipTakeCard = () => {
    if (state.turnPhase === 'takeCard') skipTakeCard();
  };
  
  const handleEndTurn = () => {
    if (state.turnPhase === 'placeCubes') skipPlaceCubes();
    endTurn();
    setSelectedTokenIndex(null);
  };
  
  const handleHabitatClick = (cardId: string, habitatIndex: number) => {
    selectHabitatCell(cardId, habitatIndex);
  };
  
  const getTurnPhaseText = () => {
    if (isPlacingEmoji) {
      return 'Click a matching tile on your board to place the animal';
    }
    switch (state.turnPhase) {
      case 'selectSlot': return 'Step 1: Select a token slot';
      case 'placeTokens': return `Step 2: Place ${state.tokensToPlace.length} token${state.tokensToPlace.length !== 1 ? 's' : ''}`;
      case 'takeCard': return 'Step 3: Take an animal card (optional)';
      case 'placeCubes': return 'Step 4: Click habitat tokens on cards to place animals';
      default: return '';
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <GameHeader
        players={state.players}
        currentPlayerIndex={state.currentPlayerIndex}
        roundNumber={state.roundNumber}
        turnPhase={state.turnPhase}
        tokensRemaining={state.tokenBag.length}
      />
      
      <main className="container mx-auto px-3 py-3">
        <div className="flex items-center justify-between mb-3 p-2 bg-card rounded border border-border">
          <p className="text-sm text-foreground font-medium">{getTurnPhaseText()}</p>
          <RulesReference />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-3 space-y-3">
            <CentralBoard
              slots={state.centralSlots}
              onSlotSelect={handleSlotSelect}
              selectedSlotId={state.selectedSlotId}
              disabled={state.turnPhase !== 'selectSlot'}
            />
            {state.tokensToPlace.length > 0 && (
              <TokensToPlace
                tokens={state.tokensToPlace}
                selectedIndex={selectedTokenIndex}
                onTokenSelect={setSelectedTokenIndex}
              />
            )}
            <GameControls
              turnPhase={state.turnPhase}
              tokensToPlaceCount={state.tokensToPlace.length}
              onEndTurn={handleEndTurn}
              onSkipTakeCard={handleSkipTakeCard}
              canEndTurn={canEndTurn}
              canSkipTakeCard={state.turnPhase === 'takeCard'}
            />
          </div>
          
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="mb-2 text-center">
              <h2 className="font-semibold text-base text-foreground">{currentPlayer.name}'s Board</h2>
              <p className="text-xs text-muted-foreground">
                {isPlacingEmoji ? 'Click a tile to place the animal' : 'Click a hex to place token'}
              </p>
            </div>
            <HexGrid
              placedTokens={currentPlayer.board}
              placedEmojis={currentPlayer.placedEmojis}
              onHexClick={handleHexClick}
              selectedTokenType={selectedTokenIndex !== null ? state.tokensToPlace[selectedTokenIndex] : null}
              isPlacingEmoji={isPlacingEmoji}
            />
          </div>
          
          <div className="lg:col-span-4 space-y-3">
            {canTakeAnimalCard ? (
              <>
                <FaceUpAnimals
                  cards={state.faceUpAnimals}
                  onCardTake={handleTakeAnimalCard}
                  canTake={canTakeAnimalCard}
                />
                <PlayerHand
                  cards={currentPlayer.handCards}
                  placedEmojis={currentPlayer.placedEmojis}
                  selectedCardId={state.selectedAnimalCardId}
                  selectedHabitatIndex={state.selectedHabitatIndex}
                  onHabitatClick={handleHabitatClick}
                  isPlaceCubesPhase={state.turnPhase === 'placeCubes'}
                  maxCards={4}
                />
              </>
            ) : (
              <>
                <PlayerHand
                  cards={currentPlayer.handCards}
                  placedEmojis={currentPlayer.placedEmojis}
                  selectedCardId={state.selectedAnimalCardId}
                  selectedHabitatIndex={state.selectedHabitatIndex}
                  onHabitatClick={handleHabitatClick}
                  isPlaceCubesPhase={state.turnPhase === 'placeCubes'}
                  maxCards={4}
                />
                <FaceUpAnimals
                  cards={state.faceUpAnimals}
                  onCardTake={handleTakeAnimalCard}
                  canTake={canTakeAnimalCard}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
