import { fail } from "@sveltejs/kit";
import { Game } from "./game";
import type { Actions, PageServerLoad } from "./$types";

import type { GameType } from "$lib/types";
import { supabaseGameStore } from "$lib/server/gameStore";

interface GameStore {
  getGame: (gameType: GameType, gameId: string) => any;
  setGame: (gameType: GameType, gameId: string, game: any) => boolean;
}

/**
 * - Will have to load for a specifc gameId
 * - Without a gameId it should load the demo state
 * - Means there will probably have to be two sets of server functions to handle the game
 *
 * - Questions about cookie security
 */

export const load = (({ cookies }) => {}) satisfies PageServerLoad;

const getGameFromStore = async (gameId: string, gameType: GameType) => {
  const gameState = await supabaseGameStore.getGame(gameType, gameId);
  return new Game(gameState);
};

export const actions = {
  newGame: async ({ request }) => {
    const data = await request.formData();
    const gameId = data.get("gameId") as string;
    const gameType = data.get("gameType") as GameType;

    const gameState = await supabaseGameStore.getGame(gameType, gameId);
    const game = new Game(gameState);

    if (!gameState) {
      await supabaseGameStore.setGame(gameType, gameId, game.toString());
    }

    return {
      guesses: game.guesses,
      answers: game.answers,
      answer: game.answers.length >= 6 ? game.answer : null,
    };
  },
  /**
   * Modify game state in reaction to a keypress. If client-side JavaScript
   * is available, this will happen in the browser instead of here
   */
  update: async ({ request, cookies }) => {
    const data = await request.formData();
    const gameId = data.get("gameId") as string;
    const gameType = data.get("gameType") as GameType;

    const gameState = await supabaseGameStore.getGame(gameType, gameId);
    const game = new Game(gameState);
    const key = data.get("key");
    const i = game.answers.length;

    if (key === "backspace") {
      game.guesses[i] = game.guesses[i].slice(0, -1);
    } else {
      game.guesses[i] += key;
    }

    cookies.set("wordle", game.toString(), { path: "" });
  },

  /**
   * Modify game state in reaction to a guessed word. This logic always runs on
   * the server, so that people can't cheat by peeking at the JavaScript
   */
  enter: async ({ request }) => {
    const data = await request.formData();
    const gameId = data.get("gameId") as string;
    const gameType = data.get("gameType") as GameType;
    const gameState = await supabaseGameStore.getGame(gameType, gameId);
    const game = new Game(gameState);

    const guess = data.getAll("guess") as string[];

    if (!game.enter(guess)) {
      return fail(400, { badGuess: true });
    }

    await supabaseGameStore.setGame(gameType, gameId, game.toString());
  },

  // Games can only be reset
  restart: async ({ request }) => {
    const data = await request.formData();
    const gameType = data.get("gameType") as GameType;
    const gameId = data.get("gameId") as string;
    const user = data.get("userAddress");

    if (!user) return fail(400);

    supabaseGameStore.setGame(gameType, gameId, new Game().toString());
  },
} satisfies Actions;
