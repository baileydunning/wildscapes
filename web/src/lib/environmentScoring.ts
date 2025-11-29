import { PlacedToken, TerrainType, HexPosition } from '@/types/game';

// Helper to get neighbors (orthogonal on a hex grid: 6 directions, axial coords)
function getNeighbors(pos: HexPosition): HexPosition[] {
  const { q, r } = pos;
  return [
    { q: q + 1, r },       // east
    { q: q - 1, r },       // west
    { q, r: r + 1 },       // southeast
    { q, r: r - 1 },       // northwest
    { q: q + 1, r: r - 1 }, // northeast
    { q: q - 1, r: r + 1 }, // southwest
  ];
}

// Helper to find stacks at a position
function getStackAt(board: PlacedToken[], pos: HexPosition): PlacedToken[] {
  return board.filter(t => t.position.q === pos.q && t.position.r === pos.r);
}

// Helper to get top token at a position
function getTopToken(board: PlacedToken[], pos: HexPosition): PlacedToken | undefined {
  const stack = getStackAt(board, pos);
  return stack.length ? stack.reduce((a, b) => (a.stackLevel > b.stackLevel ? a : b)) : undefined;
}

// Helper to get all positions on the board
function getAllPositions(board: PlacedToken[]): HexPosition[] {
  const seen = new Set<string>();
  board.forEach(t => {
    const key = `${t.position.q},${t.position.r}`;
    seen.add(key);
  });
  return Array.from(seen).map(str => {
    const [q, r] = str.split(',').map(Number);
    return { q, r };
  });
}

// 1. Trees
export function scoreTrees(board: PlacedToken[]): number {
  let score = 0;
  for (const pos of getAllPositions(board)) {
    const stack = getStackAt(board, pos);
    if (!stack.length) continue;
    const top = stack.find(t => t.token.type === 'treetop');
    if (!top) continue;
    // Count trunks below treetop
    const height =
      1 +
      stack.filter(t => t.token.type === 'trunk' && t.stackLevel < top.stackLevel).length;
    if (height === 1) score += 1;
    else if (height === 2) score += 3;
    else if (height === 3) score += 7;
  }
  return score;
}

// 2. Mountains
export function scoreMountains(board: PlacedToken[]): number {
  let score = 0;
  const positions = getAllPositions(board).filter(pos => {
    const top = getTopToken(board, pos);
    return top && top.token.type === 'mountain';
  });
  const visited = new Set<string>();

  for (const pos of positions) {
    const key = `${pos.q},${pos.r}`;
    if (visited.has(key)) continue;

    // Find range of same height
    const top = getTopToken(board, pos);
    const height = top!.stackLevel + 1;
    const range: HexPosition[] = [];
    const queue = [pos];

    while (queue.length) {
      const curr = queue.pop()!;
      const currKey = `${curr.q},${curr.r}`;
      if (visited.has(currKey)) continue;
      visited.add(currKey);
      range.push(curr);

      for (const n of getNeighbors(curr)) {
        const nTop = getTopToken(board, n);
        if (
          nTop &&
          nTop.token.type === 'mountain' &&
          nTop.stackLevel + 1 === height &&
          !visited.has(`${n.q},${n.r}`)
        ) {
          queue.push(n);
        }
      }
    }

    // Score each mountain in the range
    for (let i = 0; i < range.length; i++) {
      if (height === 1) score += 1;
      else if (height === 2) score += 3;
      else if (height === 3) score += 6;
    }
  }

  return score;
}

// 3. Fields
export function scoreFields(board: PlacedToken[]): number {
  let score = 0;
  const positions = getAllPositions(board).filter(pos => {
    const top = getTopToken(board, pos);
    return top && top.token.type === 'field';
  });
  const visited = new Set<string>();

  for (const pos of positions) {
    const key = `${pos.q},${pos.r}`;
    if (visited.has(key)) continue;

    // Find field region
    const region: HexPosition[] = [];
    const queue = [pos];

    while (queue.length) {
      const curr = queue.pop()!;
      const currKey = `${curr.q},${curr.r}`;
      if (visited.has(currKey)) continue;
      visited.add(currKey);
      region.push(curr);

      for (const n of getNeighbors(curr)) {
        const nTop = getTopToken(board, n);
        if (nTop && nTop.token.type === 'field' && !visited.has(`${n.q},${n.r}`)) {
          queue.push(n);
        }
      }
    }

    // Score region: every group of 2 tiles is worth 5 points,
    // groups of 1 score 0, groups of 3 score 5, groups of 4 score 10, etc.
    score += Math.floor(region.length / 2) * 5;
  }

  return score;
}

// 4. Buildings (updated to match RulesReference: per stack, adjacency ignored)
export function scoreBuildings(board: PlacedToken[]): number {
  let score = 0;
  // Building: stack with base (trunk, mountain, building) and building roof on top
  const baseTypes: TerrainType[] = ['trunk', 'mountain', 'building'];

  for (const pos of getAllPositions(board)) {
    const stack = getStackAt(board, pos);
    if (!stack.length) continue;

    // Roof
    const roof = stack.find(t => t.token.type === 'building');
    if (!roof) continue;

    // Must have base below roof
    const hasBaseBelow = stack.some(
      t => baseTypes.includes(t.token.type) && t.stackLevel < roof.stackLevel
    );

    if (hasBaseBelow) {
      // Each stack of 2 (base + red roof) scores 2 points, adjacency does not matter
      score += 2;
    }
  }

  return score;
}

// 5. Water
export function scoreRivers(board: PlacedToken[]): number {
  let score = 0;
  const positions = getAllPositions(board).filter(pos => {
    const top = getTopToken(board, pos);
    return top && top.token.type === 'water';
  });
  const visited = new Set<string>();

  for (const pos of positions) {
    const key = `${pos.q},${pos.r}`;
    if (visited.has(key)) continue;

    // Find river
    const river: HexPosition[] = [];
    const queue = [pos];

    while (queue.length) {
      const curr = queue.pop()!;
      const currKey = `${curr.q},${curr.r}`;
      if (visited.has(currKey)) continue;
      visited.add(currKey);
      river.push(curr);

      for (const n of getNeighbors(curr)) {
        const nTop = getTopToken(board, n);
        if (nTop && nTop.token.type === 'water' && !visited.has(`${n.q},${n.r}`)) {
          queue.push(n);
        }
      }
    }

    // Score river: 0 for 1, 2 for 2, 5 for 3, 8 for 4, 11 for 5, 15 for 6, +4 per tile beyond 6
    let riverScore = 0;
    if (river.length === 1) riverScore = 0;
    else if (river.length === 2) riverScore = 2;
    else if (river.length === 3) riverScore = 5;
    else if (river.length === 4) riverScore = 8;
    else if (river.length === 5) riverScore = 11;
    else if (river.length === 6) riverScore = 15;
    else if (river.length > 6) riverScore = 15 + (river.length - 6) * 4;

    score += riverScore;
  }

  return score;
}

// Main scoring function
export function calculateEnvironmentScore(board: PlacedToken[]): number {
  return (
    scoreTrees(board) +
    scoreMountains(board) +
    scoreFields(board) +
    scoreBuildings(board) +
    scoreRivers(board)
  );
}
