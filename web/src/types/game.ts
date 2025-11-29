import type { BoardStats, AnimalStats, OverallGameStats } from '@/types/player';

export type TerrainType = 'field' | 'water' | 'mountain' | 'trunk' | 'treetop' | 'building';

export interface TerrainToken {
  id: string;
  type: TerrainType;
}

export interface HexPosition {
  q: number;
  r: number;
}

export interface PlacedToken {
  token: TerrainToken;
  position: HexPosition;
  stackLevel: number;
}

export interface HabitatCell {
  terrain: TerrainType;
  stackLevel: number;
  relativePos: { q: number; r: number };
}

export interface AnimalCard {
  id: string;
  name: string;
  species: string;
  habitat: HabitatCell[];
  cubesRequired: number;
  points: number;
  imageUrl: string;
  description: string;
  canRotate: boolean;
  emoji: string;
  frameColors?: {
    primary: string;
    secondary: string;
  };
}

export interface PlacedAnimalEmoji {
  cardId: string;
  position: HexPosition;
  emoji: string;
  habitatIndex: number;
}

export interface PlacedAnimal {
  cardId: string;
  positions: HexPosition[];
  cubesPlaced: number;
}

export interface TokenSlot {
  id: number;
  tokens: TerrainToken[];
}

export interface PlayerState {
  id: string;
  name: string;
  color: string;
  board: PlacedToken[];
  animals: PlacedAnimal[];
  placedEmojis: PlacedAnimalEmoji[];
  handCards: AnimalCard[];
  completedCards: AnimalCard[];
  score: number;
  environmentScoreBreakdown?: {
    [key: string]: number;
  };
}

export interface GameState {
  phase: 'setup' | 'playing' | 'scoring' | 'ended';
  currentPlayerIndex: number;
  players: PlayerState[];
  centralSlots: TokenSlot[];
  animalDeck: AnimalCard[];
  faceUpAnimals: AnimalCard[];
  tokenBag: TerrainToken[];
  turnPhase: 'selectSlot' | 'placeTokens' | 'takeCard' | 'placeCubes';
  tokensToPlace: TerrainToken[];
  selectedSlotId: number | null;
  roundNumber: number;
  soloMode: boolean;
  selectedAnimalCardId: string | null;
  selectedHabitatIndex: number | null;
  boardStats?: BoardStats;
  animalStats?: AnimalStats;
  overallStats?: OverallGameStats;
}

export type GameAction =
  | { type: 'START_GAME'; players: { name: string; color: string; dbPlayerId: string }[]; soloMode?: boolean }
  | { type: 'SELECT_SLOT'; slotId: number }
  | { type: 'PLACE_TOKEN'; position: HexPosition; tokenIndex: number }
  | { type: 'TAKE_ANIMAL_CARD'; cardId: string }
  | { type: 'SKIP_TAKE_CARD' }
  | { type: 'SELECT_HABITAT_CELL'; cardId: string; habitatIndex: number }
  | { type: 'PLACE_ANIMAL_EMOJI'; position: HexPosition }
  | { type: 'SKIP_PLACE_CUBES' }
  | { type: 'END_TURN' }
  | { type: 'UNDO' };
