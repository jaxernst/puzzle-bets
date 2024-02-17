import { wordleGameCacheKey } from "$lib/server/gameStateCache";
import { supabaseGameStore } from "$lib/server/gameStateStorage";
import { Game } from "../../../../lib/server/wordle/game.server";

export const POST = async ({ request, cookies }): Promise<Response> => {
  const { guess, gameId, user } = (await request.json()) as {
    guess: string;
    gameId: string;
    user?: string;
  };

  if (!gameId || !guess) {
    return new Response("Missing params", { status: 400 });
  }

  const hasGame = await supabaseGameStore.hasGame("wordle", gameId, user);
  if (!hasGame) {
    return new Response("Game not found", { status: 404 });
  }

  const gameState = await supabaseGameStore.getGame("wordle", gameId, user);
  const game = new Game(gameState);

  const valid = game.enter(guess);
  await supabaseGameStore.setGame(game.toString(), "wordle", gameId, user);

  const solved = game.won();
  const lost = game.answers.length >= 6 && !solved;

  const cacheKey = wordleGameCacheKey(gameId);
  const gameCache = cookies.get(cacheKey);
  if (gameCache) {
    cookies.set(cacheKey, game.toString(), { path: "" });
  }

  return new Response(
    JSON.stringify({
      gameId,
      guesses: game.guesses,
      answers: game.answers,
      answer: game.answers.length >= 6 ? game.answer : null,
      solved,
      lost,
      badGuess: !valid,
    })
  );
};
