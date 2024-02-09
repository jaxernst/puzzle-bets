import type { EvmAddress, Game, GameType } from "$lib/types";
import { intToEntity } from "$lib/util";
import { supabase } from "./supabaseClient";

const chainId = import.meta.env.VITE_CHAIN_ID;

const gameStateTable = (demoGame?: boolean) => {
  return `game-state-${demoGame ? "demo" : chainId}`;
};

interface GameStore {
  hasGame: (
    gameType: GameType,
    gameId: string,
    user?: string
  ) => Promise<boolean>;
  getGame: (
    gameType: GameType,
    gameId: string,
    user?: string
  ) => Promise<string>;
  setGame: (
    gameState: string,
    gameType: GameType,
    gameId: string,
    user?: string
  ) => Promise<boolean>;
}

export const supabaseGameStore: GameStore = {
  hasGame: async (gameType, gameId, user) => {
    const isDemo = !user;
    const res = await supabase
      .from(gameStateTable(isDemo))
      .select("*")
      .eq("game_type", gameType)
      .eq("game_id", gameId)
      .eq("user_address", user ?? "NULL")
      .single();

    return Boolean(res.data);
  },
  getGame: async (gameType, gameId, user) => {
    const isDemo = !user;
    const res = await supabase
      .from(gameStateTable(isDemo))
      .select("*")
      .eq("game_type", gameType)
      .eq("game_id", gameId)
      .eq("user_address", user ?? "NULL")
      .single();

    return res.data && res.data.game_state;
  },
  setGame: async (newGameState, gameType, gameId, user) => {
    const isDemo = !user;
    const res = await supabase.from(gameStateTable(isDemo)).upsert({
      game_id: gameId,
      game_type: gameType,
      game_state: newGameState,
      user_address: user,
    });

    return Boolean(res.error);
  },
};

export const getGameResetCount = async (gameId: string, isDemo?: boolean) => {
  const res = await supabase
    .from(gameStateTable(isDemo))
    .select("reset_count")
    .eq("game_id", gameId);

  return res.data && res.data[0].reset_count;
};

export const incrementGameResetCount = async (
  gameId: string,
  chainRematchCount?: number,
  isDemo?: boolean
) => {
  const curCount = (await getGameResetCount(gameId, isDemo)) ?? 0;

  // offchain reset count should never exceed db reset count
  if (typeof chainRematchCount === "number" && curCount >= chainRematchCount) {
    return curCount;
  }

  const res = await supabase
    .from(gameStateTable(isDemo))
    .update({
      reset_count: curCount + 1,
    })
    .eq("game_id", gameId);

  if (res.error) {
    return curCount;
  } else {
    return curCount + 1;
  }
};

interface GameSettingsStore {
  setArchiveState: (
    gameId: number,
    user: string,
    archived: boolean
  ) => Promise<boolean>;
  getArchivedGames: (user: string) => Promise<string[]>;
}

export const supabaseGameSettingsStore: GameSettingsStore = {
  setArchiveState: async (gameId, user, archived) => {
    const res = await supabase.from("user-game-settings").upsert({
      game_id: gameId,
      user_address: user,
      archived,
    });

    return Boolean(res.error);
  },
  getArchivedGames: async (user) => {
    const res = await supabase
      .from("user-game-settings")
      .select("game_id")
      .eq("user_address", user)
      .eq("archived", true);

    return res.data?.map((row) => row.game_id) ?? [];
  },
};
