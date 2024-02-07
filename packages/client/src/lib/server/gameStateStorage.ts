import type { EvmAddress, Game, GameType } from "$lib/types";
import { urlGameIdToEntity } from "$lib/util";
import { supabase } from "./supabaseClient";

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

export const supabaseGameStore: GameStore = (() => {
  return {
    hasGame: async (gameType, gameId, user) => {
      const res = await supabase
        .from("game-state")
        .select("*")
        .eq("game_type", gameType)
        .eq("game_id", gameId)
        .eq("user_address", user ?? "NULL")
        .single();

      return Boolean(res.data);
    },
    getGame: async (gameType, gameId, user) => {
      const res = await supabase
        .from("game-state")
        .select("*")
        .eq("game_type", gameType)
        .eq("game_id", gameId)
        .eq("user_address", user ?? "NULL")
        .single();

      return res.data && res.data.game_state;
    },
    setGame: async (newGameState, gameType, gameId, user) => {
      const res = await supabase.from("game-state").upsert({
        game_id: gameId,
        game_type: gameType,
        game_state: newGameState,
        user_address: user,
      });

      return Boolean(res.error);
    },
  };
})();

export const getGameResetCount = async (gameId: string) => {
  const res = await supabase
    .from("game-state")
    .select("reset_count")
    .eq("game_id", gameId);

  return res.data && res.data[0].reset_count;
};

export const incrementGameResetCount = async (
  gameId: string,
  chainRematchCount?: number
) => {
  const curCount = (await getGameResetCount(gameId)) ?? 0;

  // offchain reset count should never exceed db reset count
  if (typeof chainRematchCount === "number" && curCount >= chainRematchCount) {
    return curCount;
  }

  const res = await supabase
    .from("game-state")
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
