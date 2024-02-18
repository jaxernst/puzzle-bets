import { wordleGameCacheKey } from "$lib/server/gameCacheKeys";
import {
  incrementGameResetCount,
  supabaseGameStore,
} from "$lib/server/gameStateStorage.js";
import { Game } from "../../../../lib/server/wordle/game.server";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request, cookies }) => {
  const { gameId, user, otherPlayer, chainRematchCount, isDemo } =
    (await request.json()) as {
      gameId: string;
      isDemo?: boolean;
      user?: string;
      otherPlayer?: string;
      chainRematchCount?: number;
    };

  if (!gameId) return new Response("Missing game ID", { status: 400 });

  const gameExists = await supabaseGameStore.hasGame(
    "wordle",
    gameId,
    user,
    isDemo
  );

  if (!gameExists) return new Response("No game to reset", { status: 400 });

  // gameId's that are onchain (have an associated bet) can only be reset when
  // both players vote to reset. Will need to verify both players have voted
  // and reset each players game state
  // TODO: check if both players have voted
  // TODO: get 'otherPlayer' with a contract read
  // TODO: get 'chainRematchCount' with a contract read

  const game = new Game();
  await supabaseGameStore.setGame(
    game.toString(),
    "wordle",
    gameId,
    user,
    isDemo
  );

  if (otherPlayer && !isDemo) {
    await supabaseGameStore.setGame(
      game.toString(),
      "wordle",
      gameId,
      otherPlayer
    );
  }

  const cachedGame = cookies.get(wordleGameCacheKey(gameId));
  if (cachedGame) {
    cookies.set(wordleGameCacheKey(gameId), game.toString(), { path: "/" });
  }

  const resetCount = await incrementGameResetCount(
    gameId,
    chainRematchCount,
    isDemo
  );

  return new Response(
    JSON.stringify({
      gameId: gameId,
      guesses: [],
      answers: [],
      solved: false,
      lost: false,
      answer: null,
      badGuess: false,
      resetCount,
    })
  );
};
