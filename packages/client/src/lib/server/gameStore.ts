import type { Game, GameType } from "$lib/types";
import { supabase } from "./supabaseClient";

interface GameStore {
  getGame: (gameType: GameType, gameId: string) => Promise<string>;
  setGame: (
    gameType: GameType,
    gameId: string,
    game: string
  ) => Promise<boolean>;
}

export const supabaseGameStore: GameStore = (() => {
  return {
    getGame: async (gameType: GameType, gameId: string) => {
      const res = await supabase
        .from("Game State")
        .select("*") // selects all columns; replace with specific columns if needed
        .eq("game_type", gameType)
        .eq("game_id", gameId)
        .single();

      return res.data;
    },
    setGame: async (
      gameType: GameType,
      gameId: string,
      newGameState: string
    ) => {
      const res = await supabase
        .from("Game State")
        .update({ game_state: newGameState })
        .match({ game_type: gameType, game_id: gameId });

      return Boolean(res.error);
    },
  };
})();
