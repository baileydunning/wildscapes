import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayerState } from '@/types/game';
import {
  scoreTrees,
  scoreMountains,
  scoreFields,
  scoreBuildings,
  scoreRivers,
} from '@/lib/environmentScoring';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { playerService } from '@/services/playerService';
import {
  GameStats,
  BoardStats,
  AnimalStats,
  OverallGameStats,
  PlayerGameStats,
  CardStat,
} from '@/types/player';

interface GameOverProps {
  players: PlayerState[];
  onPlayAgain: () => void;
  gameId?: string; // optional external id
  mode?: string;   // e.g. 'solo' | 'local-multiplayer'
}

type HexPos = { q: number; r: number };

const HEX_NEIGHBORS: HexPos[] = [
  { q: 1, r: 0 },
  { q: -1, r: 0 },
  { q: 0, r: 1 },
  { q: 0, r: -1 },
  { q: 1, r: -1 },
  { q: -1, r: 1 },
];

function coordKey(pos: HexPos) {
  return `${pos.q},${pos.r}`;
}

export function GameOver({ players, onPlayAgain, gameId, mode }: GameOverProps) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 1. Per-player scoring (using your existing environment scoring)
  const scoredPlayers = useMemo(
    () =>
      players.map(player => {
        const trees = scoreTrees(player.board);
        const mountains = scoreMountains(player.board);
        const fields = scoreFields(player.board);
        const buildings = scoreBuildings(player.board);
        const rivers = scoreRivers(player.board);

        const envScore = trees + mountains + fields + buildings + rivers;

        return {
          ...player,
          envScore,
          totalScore: player.score + envScore,
          envBreakdown: { trees, mountains, fields, buildings, rivers },
        };
      }),
    [players]
  );

  const sortedPlayers = useMemo(
    () => [...scoredPlayers].sort((a, b) => b.totalScore - a.totalScore),
    [scoredPlayers]
  );

  const winner = sortedPlayers[0];
  const effectiveMode = mode ?? (players.length === 1 ? 'solo' : 'local-multiplayer');

  // 2. Board stats from actual board state
  const buildBoardStats = (): BoardStats => {
    const allTiles = scoredPlayers.flatMap(p => p.board ?? []);
    if (allTiles.length === 0) {
      return {
        totalTokensPlaced: 0,
        tokensByType: {},
        averageStackHeight: 0,
        maxStackHeight: 0,
        tallestStackPositions: [],
        largestFieldGroup: 0,
        largestMountainGroup: 0,
        largestRiverGroup: 0,
        isolatedTiles: 0,
        unusedTiles: 0,
        coveragePercent: 0,
        mostCommonTerrain: '',
        leastCommonTerrain: '',
      };
    }

    type CoordEntry = {
      q: number;
      r: number;
      stackHeight: number;
      topType: string;
    };

    const coordMap = new Map<string, CoordEntry>();
    const tokensByType: Record<string, number> = {};

    for (const tile of allTiles) {
      const { q, r } = tile.position;
      const key = coordKey({ q, r });
      const stackLevel = typeof tile.stackLevel === 'number' ? tile.stackLevel : 0;
      const height = stackLevel + 1;
      const type = tile.token.type;

      tokensByType[type] = (tokensByType[type] ?? 0) + 1;

      const existing = coordMap.get(key);
      if (!existing) {
        coordMap.set(key, { q, r, stackHeight: height, topType: type });
      } else if (height > existing.stackHeight) {
        existing.stackHeight = height;
        existing.topType = type;
      }
    }

    let totalStackHeight = 0;
    let maxStackHeight = 0;
    let minQ = Infinity;
    let maxQ = -Infinity;
    let minR = Infinity;
    let maxR = -Infinity;

    for (const entry of coordMap.values()) {
      totalStackHeight += entry.stackHeight;
      if (entry.stackHeight > maxStackHeight) maxStackHeight = entry.stackHeight;
      if (entry.q < minQ) minQ = entry.q;
      if (entry.q > maxQ) maxQ = entry.q;
      if (entry.r < minR) minR = entry.r;
      if (entry.r > maxR) maxR = entry.r;
    }

    const averageStackHeight =
      coordMap.size > 0 ? totalStackHeight / coordMap.size : 0;

    const tallestStackPositions =
      maxStackHeight > 0
        ? [...coordMap.values()]
            .filter(e => e.stackHeight === maxStackHeight)
            .map(e => ({ q: e.q, r: e.r }))
        : [];

    const computeLargestGroup = (matchTypes: string[]): number => {
      const visited = new Set<string>();
      let maxGroupSize = 0;

      for (const [key, entry] of coordMap.entries()) {
        if (visited.has(key)) continue;
        if (!matchTypes.includes(entry.topType)) continue;

        let size = 0;
        const queue: string[] = [key];
        visited.add(key);

        while (queue.length) {
          const currentKey = queue.pop() as string;
          const current = coordMap.get(currentKey)!;
          size++;

          for (const offset of HEX_NEIGHBORS) {
            const neighborKey = coordKey({
              q: current.q + offset.q,
              r: current.r + offset.r,
            });
            if (visited.has(neighborKey)) continue;
            const neighbor = coordMap.get(neighborKey);
            if (!neighbor) continue;
            if (!matchTypes.includes(neighbor.topType)) continue;

            visited.add(neighborKey);
            queue.push(neighborKey);
          }
        }

        if (size > maxGroupSize) maxGroupSize = size;
      }

      return maxGroupSize;
    };

    const largestFieldGroup = computeLargestGroup(['field']);
    const largestMountainGroup = computeLargestGroup(['mountain']);
    const largestRiverGroup = computeLargestGroup(['water', 'river']);

    let isolatedTiles = 0;
    for (const entry of coordMap.values()) {
      const hasNeighbor = HEX_NEIGHBORS.some(offset => {
        const neighborKey = coordKey({
          q: entry.q + offset.q,
          r: entry.r + offset.r,
        });
        return coordMap.has(neighborKey);
      });
      if (!hasNeighbor) isolatedTiles++;
    }

    const width = maxQ - minQ + 1;
    const height = maxR - minR + 1;
    const totalCells = width * height;
    const usedCells = coordMap.size;
    const unusedTiles = Math.max(totalCells - usedCells, 0);
    const coveragePercent =
      totalCells > 0 ? Math.round((usedCells / totalCells) * 100) : 0;

    let mostCommonTerrain = '';
    let leastCommonTerrain = '';
    const tokenEntries = Object.entries(tokensByType);
    if (tokenEntries.length > 0) {
      tokenEntries.sort((a, b) => b[1] - a[1]);
      mostCommonTerrain = tokenEntries[0][0];
      leastCommonTerrain = tokenEntries[tokenEntries.length - 1][0];
    }

    return {
      totalTokensPlaced: allTiles.length,
      tokensByType,
      averageStackHeight,
      maxStackHeight,
      tallestStackPositions,
      largestFieldGroup,
      largestMountainGroup,
      largestRiverGroup,
      isolatedTiles,
      unusedTiles,
      coveragePercent,
      mostCommonTerrain,
      leastCommonTerrain,
    };
  };

  // 3. Animal stats based on completed cards
  const buildAnimalStats = (): AnimalStats => {
    const allCompletedCards: any[] = scoredPlayers.flatMap(
      p => (p as any).completedCards ?? []
    );

    const cardStats: CardStat[] = allCompletedCards.map(card => {
      const basePoints = card.basePoints ?? card.points ?? 0;
      const bonusPoints = card.bonusPoints ?? 0;
      const totalPoints =
        card.totalPoints ?? basePoints + bonusPoints;

      return {
        cardId: card.id ?? card.cardId ?? '',
        name: card.name ?? 'Unknown',
        habitatType: card.habitatType ?? card.habitat ?? 'unknown',
        cubesPlaced: card.cubesPlaced ?? card.cubes_required ?? 0,
        cubesRequired: card.cubesRequired ?? card.cubes_required ?? 0,
        completed: card.completed ?? true,
        basePoints,
        bonusPoints,
        totalPoints,
        firstCubePlacedTurn: card.firstCubePlacedTurn ?? null,
        completionTurn: card.completionTurn ?? null,
      };
    });

    const totalCollected = cardStats.length;
    const totalCompleted = cardStats.filter(c => c.completed).length;
    const totalPartial = cardStats.length - totalCompleted;

    const totalPoints = cardStats.reduce(
      (sum, c) => sum + c.totalPoints,
      0
    );
    const totalCubesPlaced = cardStats.reduce(
      (sum, c) => sum + c.cubesPlaced,
      0
    );
    const averageCubesPerAnimal =
      totalCollected > 0 ? totalCubesPlaced / totalCollected : 0;

    const habitatBreakdown: Record<string, number> = {};
    for (const c of cardStats) {
      const h = (c.habitatType ?? 'unknown').toLowerCase();
      habitatBreakdown[h] = (habitatBreakdown[h] ?? 0) + 1;
    }

    const distinctHabitats = Object.keys(habitatBreakdown).length;
    const TOTAL_HABITATS = 5; // forest, field, water, mountain, building
    const diversityScore =
      TOTAL_HABITATS > 0 ? distinctHabitats / TOTAL_HABITATS : 0;

    let mostValuableAnimal: string | null = null;
    let bestPoints = -Infinity;
    for (const c of cardStats) {
      if (c.totalPoints > bestPoints) {
        bestPoints = c.totalPoints;
        mostValuableAnimal = c.name;
      }
    }

    return {
      totalCollected,
      totalCompleted,
      totalPartial,
      totalPoints,
      diversityScore,
      habitatBreakdown,
      averageCubesPerAnimal,
      cardStats,
      mostValuableAnimal,
    };
  };

  // 4. Persist GameStats when GameOver appears
  useEffect(() => {
    if (!scoredPlayers.length) return;

    const effectiveGameId = gameId ?? `game-${Date.now()}`;

    const save = async () => {
      try {
        setSaving(true);
        setSaveError(null);

        const playerStats: PlayerGameStats[] = sortedPlayers.map((p, idx) => {
          // Use the real DB id carried on PlayerState if present
          const dbPlayerId = (p as any).dbPlayerId;
          const playerId =
            dbPlayerId ?? (p as any).playerId ?? (p as any).id ?? '';

          const turnsTaken =
            typeof (p as any).turnsTaken === 'number'
              ? (p as any).turnsTaken
              : (p.board?.length ?? 0) +
                ((p.completedCards?.length ?? 0) || 0);

          return {
            playerId,
            playerName: p.name,
            finalScore: p.totalScore,
            environmentPoints: p.envScore,
            animalPoints: p.score, // you can change this to 0 if you want overall animal points to be 0
            turnsTaken,
            tokensPlaced: p.board?.length ?? 0,
            animalsCompleted: p.completedCards?.length ?? 0,
            rank: idx + 1,
            isWinner: idx === 0,
          };
        });

        const finalScore = playerStats.reduce(
          (sum, ps) => sum + ps.finalScore,
          0
        );
        const environmentPoints = playerStats.reduce(
          (sum, ps) => sum + ps.environmentPoints,
          0
        );
        const animalPoints = playerStats.reduce(
          (sum, ps) => sum + ps.animalPoints,
          0
        );
        const turnsTaken = playerStats.reduce(
          (sum, ps) => sum + ps.turnsTaken,
          0
        );
        const totalActions = playerStats.reduce(
          (sum, ps) => sum + ps.tokensPlaced + ps.animalsCompleted,
          0
        );
        const skippedActions = 0;

        const overall: OverallGameStats = {
          finalScore,
          environmentPoints,
          animalPoints,
          turnsTaken,
          totalActions,
          skippedActions,
          playerCount: playerStats.length,
          averageScorePerPlayer:
            playerStats.length > 0
              ? finalScore / playerStats.length
              : 0,
          gameWasFastestSoFar: false,
        };

        const boardStats = buildBoardStats();
        const animalStats = buildAnimalStats();

        const now = new Date();

        const payload: GameStats = {
          id: crypto.randomUUID(),
          gameId: effectiveGameId,
          mode: effectiveMode,
          createdAt: now,
          updatedAt: now,
          board: boardStats,
          animals: animalStats,
          overall,
          players: playerStats,
        };

        await playerService.createGameStats(payload);
      } catch (err: any) {
        console.error('Failed to save game stats', err);
        setSaveError(err?.message ?? 'Failed to save game stats.');
      } finally {
        setSaving(false);
      }
    };

    void save();
  }, [scoredPlayers, sortedPlayers, gameId, effectiveMode]);

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
          <h2 className="font-semibold text-base text-foreground mb-4">
            Final Scores
          </h2>

          <div className="space-y-2">
            {sortedPlayers.map((player, i) => (
              <div
                key={player.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-md transition-all',
                  i === 0
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted/50'
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
                  <p className="font-medium text-sm text-foreground">
                    {player.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {player.completedCards.length} animals, {player.board.length}{' '}
                    tokens
                  </p>
                  <div className="text-xs text-green-700">
                    <div>Environment: {player.envScore} pts</div>
                    <div className="pl-2 text-xs text-muted-foreground">
                      <div>Trees: {player.envBreakdown.trees}</div>
                      <div>Mountains: {player.envBreakdown.mountains}</div>
                      <div>
                        Fields: {player.envBreakdown.fields} (5 pts per group of
                        2)
                      </div>
                      <div>Buildings: {player.envBreakdown.buildings}</div>
                      <div>
                        Rivers: {player.envBreakdown.rivers} (see rules for
                        scoring)
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700">
                    Animal Cards: {player.score} pts
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-foreground">
                    {player.totalScore}
                  </p>
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
          <h3 className="font-semibold text-xs text-foreground mb-2">
            Scoring Summary
          </h3>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            <li>
              Trees: Each stack ending with a Tree Top scores by height: 1 (just
              Tree Top), 3 (Trunk+Tree Top), 7 (Trunk+Trunk+Tree Top).
            </li>
            <li>
              Mountains: Each range of orthogonally adjacent mountains of the
              same height scores 1/3/6 per mountain (height 1/2/3).
            </li>
            <li>
              Fields: Each group of 2 orthogonally connected yellow field tiles
              counts as 1 field worth 5 points. Multiple separate groups score
              separately (e.g., two groups of 2 = 10 points).
            </li>
            <li>
              Buildings: Each stack of 2 (base + red roof) scores 2 points.
              Adjacency does not matter.
            </li>
            <li>
              Water: Each river scores:
              <br />
              &nbsp;&nbsp;• Length 1: 0 points
              <br />
              &nbsp;&nbsp;• Length 2: 2 points
              <br />
              &nbsp;&nbsp;• Length 3: 5 points
              <br />
              &nbsp;&nbsp;• Length 4: 8 points
              <br />
              &nbsp;&nbsp;• Length 5: 11 points
              <br />
              &nbsp;&nbsp;• Length 6: 15 points
              <br />
              &nbsp;&nbsp;• Length 7+: 15 + 4 points for each additional tile
              <br />
            </li>
            <li>Animals: Card point value for completed animal cards.</li>
          </ul>
        </div>

        {saveError && (
          <p className="text-xs text-red-500 mb-3">{saveError}</p>
        )}

        <div className="flex gap-2">
          <Button onClick={onPlayAgain} className="w-full" disabled={saving}>
            {saving ? 'Saving…' : 'Play Again'}
          </Button>
          <Link to="/stats" className="w-full">
            <Button
              variant="outline"
              className="w-full"
              disabled={saving}
            >
              View Stats
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
