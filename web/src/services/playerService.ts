import { User, Player, GameStats } from '@/types/player';

const USER_ENDPOINT = '/user/';
const PLAYER_ENDPOINT = '/player/';
const GAME_STATS_ENDPOINT = '/game_stats/';

async function handleJsonResponse<T>(res: Response, context: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to ${context}: ${res.status} ${text}`);
  }
  const json = await res.json();
  return (json.body ?? json) as T;
}

export const playerService = {
  // -------- USERS --------
  async getUsers(): Promise<User[]> {
    const res = await fetch(USER_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleJsonResponse<User[]>(res, 'fetch users');
  },

  async createUser(user: User): Promise<User> {
    const res = await fetch(USER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    const created = await handleJsonResponse<User[] | User>(res, 'create user');
    // Handle either [user] or user shapes
    return Array.isArray(created) ? created[0] : created;
  },

  // -------- PLAYERS --------
  async getPlayers(): Promise<Player[]> {
    const res = await fetch(PLAYER_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleJsonResponse<Player[]>(res, 'fetch players');
  },

  async createPlayer(player: Player): Promise<Player> {
    const res = await fetch(PLAYER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(player),
    });
    const created = await handleJsonResponse<Player[] | Player>(res, 'create player');
    return Array.isArray(created) ? created[0] : created;
  },

  // -------- GAME STATS --------
  async getGameStats(): Promise<GameStats[]> {
    const res = await fetch(GAME_STATS_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleJsonResponse<GameStats[]>(res, 'fetch game stats');
  },

  async createGameStats(stats: GameStats): Promise<GameStats> {
    const res = await fetch(GAME_STATS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stats),
    });
    const created = await handleJsonResponse<GameStats[] | GameStats>(
      res,
      'create game stats'
    );
    return Array.isArray(created) ? created[0] : created;
  },

  /**
   * Helper that creates a new User + Player with linked ids.
   * We generate ids on the client so we can wire user.playerIds and player.userId.
   */
  async createUserWithDefaultPlayer(
    displayName: string,
    handle: string,
    avatarEmoji: string
  ): Promise<{ user: User; player: Player }> {
    const now = new Date();
    const newUserId = crypto.randomUUID?.() ?? `user-${Date.now()}`;
    const newPlayerId = crypto.randomUUID?.() ?? `player-${Date.now()}`;

    const userPayload: User = {
      id: newUserId,
      displayName,
      avatarEmoji,
      handle,
      playerIds: [newPlayerId],
      createdAt: now,
      updatedAt: now,
    };

    const playerPayload: Player = {
      id: newPlayerId,
      userId: newUserId,
      displayName,
      avatarEmoji,
      colorTheme: 'forest', // you can make this configurable later
      totalGamesPlayed: 0,
      highestScore: 0,
      totalPointsEarned: 0,
      createdAt: now,
      updatedAt: now,
    };

    const [createdUser, createdPlayer] = await Promise.all([
      this.createUser(userPayload),
      this.createPlayer(playerPayload),
    ]);

    return { user: createdUser, player: createdPlayer };
  },
};
