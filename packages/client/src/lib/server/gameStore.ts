import type { EvmAddress, Game, GameType } from "$lib/types";
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
