import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { User, Player, GameStats } from '@/types/player';
import { playerService } from '@/services/playerService';

interface PlayerContextType {
  currentUser: User | null;
  currentPlayer: Player | null;
  users: User[];
  players: Player[];
  gameStats: GameStats[];
  setPlayer: (player: Player, user: User) => void;
  clearPlayer: () => void;
  searchUsers: (query: string) => User[];
  getPlayersForUser: (userId: string) => Player[];
  getStatsForPlayer: (playerId: string) => GameStats[];
  createUser: (
    displayName: string,
    handle: string,
    avatarEmoji: string
  ) => Promise<{ user: User; player: Player }>;
  // 🔑 new
  refreshGameStats: () => Promise<void>;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  isLoading: boolean;
  error: string | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hydrateGameStats = useCallback((stats: GameStats[]) => {
    setGameStats(
      stats.sort(
        (a, b) =>
          new Date(b.createdAt as any).getTime() -
          new Date(a.createdAt as any).getTime()
      )
    );
  }, []);

  // 🔑 public refresh you can call after saving a game
  const refreshGameStats = useCallback(async () => {
    try {
      const fetchedGameStats = await playerService.getGameStats();
      hydrateGameStats(fetchedGameStats);
    } catch (err) {
      console.error('Failed to refresh game stats', err);
    }
  }, [hydrateGameStats]);

  // ---- Initial load from Harper + localStorage hydrate ----
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [fetchedUsers, fetchedPlayers, fetchedGameStats] =
          await Promise.all([
            playerService.getUsers(),
            playerService.getPlayers(),
            playerService.getGameStats(),
          ]);

        if (cancelled) return;

        setUsers(fetchedUsers);
        setPlayers(fetchedPlayers);
        hydrateGameStats(fetchedGameStats);

        // Restore current user/player from localStorage if they still exist
        const savedPlayerId = localStorage.getItem('currentPlayerId');
        const savedUserId = localStorage.getItem('currentUserId');

        if (savedPlayerId && savedUserId) {
          const player = fetchedPlayers.find((p) => p.id === savedPlayerId);
          const user = fetchedUsers.find((u) => u.id === savedUserId);
          if (player && user) {
            setCurrentPlayer(player);
            setCurrentUser(user);
          } else {
            localStorage.removeItem('currentPlayerId');
            localStorage.removeItem('currentUserId');
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('Failed to load player data from HarperDB', err);
          setError(err?.message ?? 'Failed to load player data');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [hydrateGameStats]);

  // ---- Core setters ----
  const setPlayer = useCallback((player: Player, user: User) => {
    setCurrentPlayer(player);
    setCurrentUser(user);
    localStorage.setItem('currentPlayerId', player.id);
    localStorage.setItem('currentUserId', user.id);
  }, []);

  const clearPlayer = useCallback(() => {
    setCurrentPlayer(null);
    setCurrentUser(null);
    localStorage.removeItem('currentPlayerId');
    localStorage.removeItem('currentUserId');
  }, []);

  // ---- Queries over loaded data ----
  const searchUsers = useCallback(
    (query: string): User[] => {
      if (!query.trim()) return users;
      const lower = query.toLowerCase();
      return users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(lower) ||
          u.handle.toLowerCase().includes(lower)
      );
    },
    [users]
  );

  const getPlayersForUser = useCallback(
    (userId: string): Player[] => {
      return players.filter((p) => p.userId === userId);
    },
    [players]
  );

  const getStatsForPlayer = useCallback(
    (playerId: string): GameStats[] => {
      return gameStats
        .filter((gs) => gs.players.some((p) => p.playerId === playerId))
        .sort(
          (a, b) =>
            new Date(b.createdAt as any).getTime() -
            new Date(a.createdAt as any).getTime()
        );
    },
    [gameStats]
  );

  // ---- Create user + default player in Harper ----
  const createUser = useCallback(
    async (
      displayName: string,
      handle: string,
      avatarEmoji: string
    ): Promise<{ user: User; player: Player }> => {
      const handleExists = users.some(
        (u) => u.handle.toLowerCase() === handle.toLowerCase()
      );
      if (handleExists) {
        throw new Error('Handle already exists');
      }

      const { user, player } =
        await playerService.createUserWithDefaultPlayer(
          displayName,
          handle,
          avatarEmoji
        );

      setUsers((prev) => [...prev, user]);
      setPlayers((prev) => [...prev, player]);

      return { user, player };
    },
    [users]
  );

  // ---- Modal controls ----
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <PlayerContext.Provider
      value={{
        currentUser,
        currentPlayer,
        users,
        players,
        gameStats,
        setPlayer,
        clearPlayer,
        searchUsers,
        getPlayersForUser,
        getStatsForPlayer,
        createUser,
        refreshGameStats,
        isModalOpen,
        openModal,
        closeModal,
        isLoading,
        error,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return ctx;
}
