// User & Player types based on HarperDB schema

export interface User {
    id: string;
    displayName: string;
    avatarEmoji: string;
    handle: string;
    playerIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Player {
    id: string;
    userId: string;
    displayName: string;
    avatarEmoji: string;
    colorTheme: string;
    totalGamesPlayed: number;
    totalPointsEarned: number;
    highestScore: number;
    createdAt: Date;
    updatedAt: Date;
}

// Game Stats types
export interface BoardStats {
    totalTokensPlaced: number;
    tokensByType: Record<string, number>;
    averageStackHeight: number;
    maxStackHeight: number;
    tallestStackPositions: { q: number; r: number }[];
    largestFieldGroup: number;
    largestMountainGroup: number;
    largestRiverGroup: number;
    isolatedTiles: number;
    unusedTiles: number;
    coveragePercent: number;
    mostCommonTerrain: string;
    leastCommonTerrain: string;
}

export interface CardStat {
    cardId: string;
    name: string;
    habitatType: string;
    cubesPlaced: number;
    cubesRequired: number;
    completed: boolean;
    basePoints: number;
    bonusPoints: number;
    totalPoints: number;
    firstCubePlacedTurn: number | null;
    completionTurn: number | null;
}

export interface AnimalStats {
    totalCollected: number;
    totalCompleted: number;
    totalPartial: number;
    totalPoints: number;
    diversityScore: number;
    habitatBreakdown: Record<string, number>;
    averageCubesPerAnimal: number;
    cardStats: CardStat[];
    mostValuableAnimal: string | null;
}

export interface OverallGameStats {
    finalScore: number;
    environmentPoints: number;
    animalPoints: number;
    turnsTaken: number;
    totalActions: number;
    skippedActions: number;
    playerCount: number;
    averageScorePerPlayer: number;
    gameWasFastestSoFar: boolean;
}

export interface PlayerGameStats {
    playerId: string;
    playerName: string;
    finalScore: number;
    environmentPoints: number;
    animalPoints: number;
    turnsTaken: number;
    tokensPlaced: number;
    animalsCompleted: number;
    rank: number;
    isWinner: boolean;
}

export interface GameStats {
    id: string;
    gameId: string;
    mode: string;
    createdAt: Date;
    updatedAt: Date;
    board: BoardStats;
    animals: AnimalStats;
    overall: OverallGameStats;
    players: PlayerGameStats[];
}
