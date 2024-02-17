import type { PageServerLoad } from "./$types";
import { generateRandomID } from "$lib/util";
import { getOrCreateDemo } from "../../../api/wordle/get-or-create-game/getOrCreate";
import { wordleGameCacheKey } from "$lib/server/gameCacheKeys";
import { Game } from "$lib/server/wordle/game.server";

export const load = (async ({ cookies }) => {
  let gameId = cookies.get("gameId");
  if (!gameId) {
    gameId = generateRandomID(32);
    cookies.set("gameId", gameId, { path: "" });
  }

  const cachedGame = cookies.get(wordleGameCacheKey(gameId));

  let game: Game;
  if (cachedGame) {
    game = new Game(cachedGame);
  } else {
    game = await getOrCreateDemo(gameId);
  }

  return {
    gameId,
    guesses: game.guesses,
    answers: game.answers,
    answer: game.answers.length >= 6 ? game.answer : null,
  };
}) satisfies PageServerLoad;
