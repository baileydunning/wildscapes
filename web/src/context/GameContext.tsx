import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
    GameState,
    GameAction,
    TerrainToken,
    TerrainType,
    TokenSlot,
    HexPosition,
    PlacedToken,
    PlacedAnimalEmoji,
} from '@/types/game';
import { animalCards, shuffleArray } from '@/data/animalCards';
import {
    scoreTrees,
    scoreMountains,
    scoreFields,
    scoreBuildings,
    scoreRivers,
} from '@/lib/environmentScoring';

const TOKEN_COUNTS: Record<TerrainType, number> = {
    field: 15,
    water: 15,
    mountain: 12,
    trunk: 12,
    treetop: 10,
    building: 8,
};

const SLOTS_NORMAL = 5;
const SLOTS_SOLO = 3;
const FACE_UP_NORMAL = 5;
const FACE_UP_SOLO = 3;

function generateTokenBag(): TerrainToken[] {
    const tokens: TerrainToken[] = [];
    let id = 0;
    for (const [type, count] of Object.entries(TOKEN_COUNTS)) {
        for (let i = 0; i < count; i++) {
            tokens.push({ id: `token-${id++}`, type: type as TerrainType });
        }
    }
    return shuffleArray(tokens);
}

function drawTokens(
    bag: TerrainToken[],
    count: number
): { drawn: TerrainToken[]; remaining: TerrainToken[] } {
    const drawn = bag.slice(0, count);
    const remaining = bag.slice(count);
    return { drawn, remaining };
}

function createInitialSlots(
    bag: TerrainToken[],
    slotCount: number
): { slots: TokenSlot[]; remaining: TerrainToken[] } {
    const slots: TokenSlot[] = [];
    let currentBag = [...bag];
    for (let i = 0; i < slotCount; i++) {
        const { drawn, remaining } = drawTokens(currentBag, 3);
        slots.push({ id: i, tokens: drawn });
        currentBag = remaining;
    }
    return { slots, remaining: currentBag };
}

const initialState: GameState = {
    phase: 'setup',
    currentPlayerIndex: 0,
    players: [],
    centralSlots: [],
    animalDeck: [],
    faceUpAnimals: [],
    tokenBag: [],
    turnPhase: 'selectSlot',
    tokensToPlace: [],
    selectedSlotId: null,
    roundNumber: 1,
    soloMode: false,
    selectedAnimalCardId: null,
    selectedHabitatIndex: null,
};

function canPlaceTokenOnStack(
    existingStack: PlacedToken[],
    newTokenType: TerrainType
): boolean {
    const stackHeight = existingStack.length;
    if (stackHeight === 0) return true;

    const topToken = existingStack[stackHeight - 1];
    const topType = topToken.token.type;

    // Cannot stack on field or water
    if (topType === 'field' || topType === 'water') return false;
    if (newTokenType === 'field' || newTokenType === 'water') return false;

    // Cannot stack on treetop
    if (topType === 'treetop') return false;

    // Building logic: allow building roof on trunk, mountain, or building base
    const baseTypes = new Set(['trunk', 'mountain', 'building']);
    if (baseTypes.has(topType) && newTokenType === 'building') return true;

    // Stacking rules for mountain
    if (topType === 'mountain') {
        if (newTokenType === 'mountain' && stackHeight < 3) return true;
        return false;
    }

    // Stacking rules for trunk
    if (topType === 'trunk') {
        if (newTokenType === 'trunk' && stackHeight < 2) return true;
        if (newTokenType === 'treetop') return true;
        return false;
    }

    return false;
}

function canPlaceToken(
    board: PlacedToken[],
    position: HexPosition,
    tokenType: TerrainType
): { canPlace: boolean; stackLevel: number } {
    const existingAtPosition = board
        .filter(p => p.position.q === position.q && p.position.r === position.r)
        .sort((a, b) => a.stackLevel - b.stackLevel);

    const stackLevel = existingAtPosition.length;
    if (stackLevel >= 3) return { canPlace: false, stackLevel };

    const canPlace = canPlaceTokenOnStack(existingAtPosition, tokenType);
    return { canPlace, stackLevel };
}

function isValidBoardPosition(pos: HexPosition): boolean {
    const absQ = Math.abs(pos.q);
    const absR = Math.abs(pos.r);
    const absS = Math.abs(-pos.q - pos.r);
    return absQ <= 3 && absR <= 3 && absS <= 3;
}

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'START_GAME': {
            const soloMode = action.soloMode || action.players.length === 1;
            const slotCount = soloMode ? SLOTS_SOLO : SLOTS_NORMAL;
            const faceUpCount = soloMode ? FACE_UP_SOLO : FACE_UP_NORMAL;

            const tokenBag = generateTokenBag();
            const { slots, remaining } = createInitialSlots(tokenBag, slotCount);
            const shuffledAnimals = shuffleArray([...animalCards]);

            const players = action.players.map((p, i) => ({
                // local runtime/seat id, used for turn order & rendering
                id: `player-${i}`,
                // Harper Player.id from the database
                dbPlayerId: p.dbPlayerId,
                name: p.name,
                color: p.color,
                board: [],
                animals: [],
                placedEmojis: [],
                handCards: [],
                completedCards: [],
                score: 0,
            }));

            return {
                ...state,
                phase: 'playing',
                players,
                centralSlots: slots,
                tokenBag: remaining,
                animalDeck: shuffledAnimals.slice(faceUpCount),
                faceUpAnimals: shuffledAnimals.slice(0, faceUpCount),
                turnPhase: 'selectSlot',
                soloMode,
                selectedAnimalCardId: null,
                selectedHabitatIndex: null,
            };
        }

        case 'SELECT_SLOT': {
            const slot = state.centralSlots.find(s => s.id === action.slotId);
            if (!slot || slot.tokens.length === 0) return state;
            return {
                ...state,
                selectedSlotId: action.slotId,
                tokensToPlace: [...slot.tokens],
                turnPhase: 'placeTokens',
            };
        }

        case 'PLACE_TOKEN': {
            if (state.tokensToPlace.length === 0) return state;
            const token = state.tokensToPlace[action.tokenIndex];
            if (!token) return state;

            const currentPlayer = state.players[state.currentPlayerIndex];
            const { canPlace, stackLevel } = canPlaceToken(
                currentPlayer.board,
                action.position,
                token.type
            );
            if (!canPlace || !isValidBoardPosition(action.position)) return state;

            // Check if position has an animal emoji
            const hasEmoji = currentPlayer.placedEmojis.some(
                e => e.position.q === action.position.q && e.position.r === action.position.r
            );
            if (hasEmoji) return state;

            const newBoard = [
                ...currentPlayer.board,
                { token, position: action.position, stackLevel },
            ];
            const newTokensToPlace = state.tokensToPlace.filter(
                (_, i) => i !== action.tokenIndex
            );
            const newPlayers = state.players.map((p, i) =>
                i === state.currentPlayerIndex ? { ...p, board: newBoard } : p
            );
            const newTurnPhase =
                newTokensToPlace.length === 0 ? 'takeCard' : 'placeTokens';

            return {
                ...state,
                players: newPlayers,
                tokensToPlace: newTokensToPlace,
                turnPhase: newTurnPhase,
            };
        }

        case 'TAKE_ANIMAL_CARD': {
            if (state.turnPhase !== 'takeCard') return state;
            const currentPlayer = state.players[state.currentPlayerIndex];
            // If player already has 4 animal cards, skip to placeCubes phase
            if (currentPlayer.handCards.length >= 4) {
                return { ...state, turnPhase: 'placeCubes' };
            }

            const card = state.faceUpAnimals.find(c => c.id === action.cardId);
            if (!card) return state;

            const newHand = [...currentPlayer.handCards, card];
            const newFaceUp = state.faceUpAnimals.filter(c => c.id !== action.cardId);
            const newPlayers = state.players.map((p, i) =>
                i === state.currentPlayerIndex ? { ...p, handCards: newHand } : p
            );

            return {
                ...state,
                players: newPlayers,
                faceUpAnimals: newFaceUp,
                turnPhase: 'placeCubes',
            };
        }

        case 'SKIP_TAKE_CARD': {
            if (state.turnPhase !== 'takeCard') return state;
            return { ...state, turnPhase: 'placeCubes' };
        }

        case 'SELECT_HABITAT_CELL': {
            if (state.turnPhase !== 'placeCubes') return state;
            const currentPlayer = state.players[state.currentPlayerIndex];
            const card = currentPlayer.handCards.find(c => c.id === action.cardId);
            if (!card) return state;

            // Check if this habitat cell already has an emoji placed
            const alreadyPlaced = currentPlayer.placedEmojis.some(
                e => e.cardId === action.cardId && e.habitatIndex === action.habitatIndex
            );
            if (alreadyPlaced) return state;

            return {
                ...state,
                selectedAnimalCardId: action.cardId,
                selectedHabitatIndex: action.habitatIndex,
            };
        }

        case 'PLACE_ANIMAL_EMOJI': {
            if (state.turnPhase !== 'placeCubes') return state;
            if (
                state.selectedAnimalCardId === null ||
                state.selectedHabitatIndex === null
            )
                return state;

            const currentPlayer = state.players[state.currentPlayerIndex];
            const card = currentPlayer.handCards.find(
                c => c.id === state.selectedAnimalCardId
            );
            if (!card) return state;

            const habitatCell = card.habitat[state.selectedHabitatIndex];
            if (!habitatCell) return state;

            // Validate the board position matches the required terrain and stack level
            const tokensAtPosition = currentPlayer.board
                .filter(
                    t =>
                        t.position.q === action.position.q &&
                        t.position.r === action.position.r
                )
                .sort((a, b) => a.stackLevel - b.stackLevel);

            if (tokensAtPosition.length === 0) return state;

            const topToken = tokensAtPosition[tokensAtPosition.length - 1];
            const stackHeight = tokensAtPosition.length;

            // Check terrain type matches
            if (topToken.token.type !== habitatCell.terrain) return state;

            // Check stack level matches (stackLevel in habitat is 0-indexed for flat, 1+ for stacks)
            if (habitatCell.stackLevel === 0 && stackHeight !== 1) return state;
            if (habitatCell.stackLevel > 0 && stackHeight < habitatCell.stackLevel + 1)
                return state;

            // Check if position already has an emoji
            const posHasEmoji = currentPlayer.placedEmojis.some(
                e =>
                    e.position.q === action.position.q &&
                    e.position.r === action.position.r
            );
            if (posHasEmoji) return state;

            // Place the emoji
            const newEmoji: PlacedAnimalEmoji = {
                cardId: state.selectedAnimalCardId,
                position: action.position,
                emoji: card.emoji,
                habitatIndex: state.selectedHabitatIndex,
            };

            const newPlacedEmojis = [...currentPlayer.placedEmojis, newEmoji];

            // Check if card is completed (all habitat cells have emojis)
            const emojisForCard = newPlacedEmojis.filter(e => e.cardId === card.id);
            const isCardCompleted = emojisForCard.length === card.habitat.length;

            let newHandCards = currentPlayer.handCards;
            let newCompletedCards = currentPlayer.completedCards;

            if (isCardCompleted) {
                newHandCards = currentPlayer.handCards.filter(c => c.id !== card.id);
                newCompletedCards = [...currentPlayer.completedCards, card];
            }

            const newPlayers = state.players.map((p, i) =>
                i === state.currentPlayerIndex
                    ? {
                        ...p,
                        placedEmojis: newPlacedEmojis,
                        handCards: newHandCards,
                        completedCards: newCompletedCards,
                    }
                    : p
            );

            return {
                ...state,
                players: newPlayers,
                selectedAnimalCardId: null,
                selectedHabitatIndex: null,
            };
        }

        case 'SKIP_PLACE_CUBES': {
            if (state.turnPhase !== 'placeCubes') return state;
            return { ...state, selectedAnimalCardId: null, selectedHabitatIndex: null };
        }

        case 'END_TURN': {
            let newBag = [...state.tokenBag];
            const newSlots = state.centralSlots.map(slot => {
                if (slot.id === state.selectedSlotId) {
                    const { drawn, remaining } = drawTokens(newBag, 3);
                    newBag = remaining;
                    return { ...slot, tokens: drawn };
                }
                return slot;
            });

            const faceUpCount = state.soloMode ? FACE_UP_SOLO : FACE_UP_NORMAL;
            const cardsNeeded = faceUpCount - state.faceUpAnimals.length;
            const newCards = state.animalDeck.slice(0, cardsNeeded);
            const newDeck = state.animalDeck.slice(cardsNeeded);
            const newFaceUp = [...state.faceUpAnimals, ...newCards];

            const currentPlayer = state.players[state.currentPlayerIndex];
            const emptySpaces = 37 - currentPlayer.board.length;
            const isEndgame = newBag.length < 3 || emptySpaces <= 2;

            // Score breakdown for each player
            const newPlayers = state.players.map(p => {
                const animalScore = p.completedCards.reduce(
                    (sum, card) => sum + card.points,
                    0
                );
                const trees = scoreTrees(p.board);
                const mountains = scoreMountains(p.board);
                const fields = scoreFields(p.board);
                const buildings = scoreBuildings(p.board);
                const rivers = scoreRivers(p.board);
                const envScore = trees + mountains + fields + buildings + rivers;

                return {
                    ...p,
                    // score is *animal cards only*
                    score: animalScore,
                    // envScore is recomputed in GameOver; we just keep the breakdown here
                    environmentScoreBreakdown: {
                        Trees: trees,
                        Mountains: mountains,
                        Fields: fields,
                        Buildings: buildings,
                        Rivers: rivers,
                    },
                };
            });

            const nextPlayerIndex =
                (state.currentPlayerIndex + 1) % state.players.length;
            const newRound =
                nextPlayerIndex === 0 ? state.roundNumber + 1 : state.roundNumber;

            return {
                ...state,
                centralSlots: newSlots,
                tokenBag: newBag,
                animalDeck: newDeck,
                faceUpAnimals: newFaceUp,
                players: newPlayers,
                currentPlayerIndex: nextPlayerIndex,
                turnPhase: 'selectSlot',
                tokensToPlace: [],
                selectedSlotId: null,
                selectedAnimalCardId: null,
                selectedHabitatIndex: null,
                roundNumber: newRound,
                phase: isEndgame ? 'ended' : 'playing',
            };
        }

        default:
            return state;
    }
}

interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<GameAction>;
    startGame: (
        players: { name: string; color: string; dbPlayerId: string }[],
        soloMode?: boolean
    ) => void;
    selectSlot: (slotId: number) => void;
    placeToken: (position: HexPosition, tokenIndex: number) => void;
    takeAnimalCard: (cardId: string) => void;
    skipTakeCard: () => void;
    selectHabitatCell: (cardId: string, habitatIndex: number) => void;
    placeAnimalEmoji: (position: HexPosition) => void;
    skipPlaceCubes: () => void;
    endTurn: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const startGame = useCallback(
        (
            players: { name: string; color: string; dbPlayerId: string }[],
            soloMode?: boolean
        ) => {
            dispatch({ type: 'START_GAME', players, soloMode });
        },
        []
    );

    const selectSlot = useCallback((slotId: number) => {
        dispatch({ type: 'SELECT_SLOT', slotId });
    }, []);

    const placeToken = useCallback((position: HexPosition, tokenIndex: number) => {
        dispatch({ type: 'PLACE_TOKEN', position, tokenIndex });
    }, []);

    const takeAnimalCard = useCallback((cardId: string) => {
        dispatch({ type: 'TAKE_ANIMAL_CARD', cardId });
    }, []);

    const skipTakeCard = useCallback(() => {
        dispatch({ type: 'SKIP_TAKE_CARD' });
    }, []);

    const selectHabitatCell = useCallback(
        (cardId: string, habitatIndex: number) => {
            dispatch({ type: 'SELECT_HABITAT_CELL', cardId, habitatIndex });
        },
        []
    );

    const placeAnimalEmoji = useCallback((position: HexPosition) => {
        dispatch({ type: 'PLACE_ANIMAL_EMOJI', position });
    }, []);

    const skipPlaceCubes = useCallback(() => {
        dispatch({ type: 'SKIP_PLACE_CUBES' });
    }, []);

    const endTurn = useCallback(() => {
        dispatch({ type: 'END_TURN' });
    }, []);

    return (
        <GameContext.Provider
            value={{
                state,
                dispatch,
                startGame,
                selectSlot,
                placeToken,
                takeAnimalCard,
                skipTakeCard,
                selectHabitatCell,
                placeAnimalEmoji,
                skipPlaceCubes,
                endTurn,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a GameProvider');
    return context;
}
