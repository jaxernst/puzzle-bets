import { wordleGameCacheKey } from "$lib/server/gameStateCache";
import { getGameResetCount } from "$lib/server/gameStateStorage";
import { Game } from "../../../../lib/server/wordle/game.server";
import { getOrCreateDemo, getOrCreateLiveGame } from "./getOrCreate";

export const POST = async ({ request, cookies }): Promise<Response> => {
  const { gameId, user, opponent } = (await request.json()) as {
    gameId: string;
    // Temporarily get the opponent from the client as a param.
    // TODO: Query the smart contracts to get opponent for security (client can't
    // be trusted to provided the correct opponent)
    opponent?: string;
    user?: string;
  };

  // If a user is provided, this implies a non-demo game and thus the opponent
  // must be provided too
  if ((user && !opponent) || (opponent && !user)) {
    return new Response("Missing parameter", { status: 400 });
  }

  if (!gameId) return new Response("Missing game ID", { status: 400 });

  const isDemoGame = !opponent;

  const cacheKey = wordleGameCacheKey(gameId);
  const gameCache = cookies.get(cacheKey);

  let game: Game;
  if (gameCache) {
    game = new Game(gameCache);
  } else if (isDemoGame) {
    game = await getOrCreateDemo(gameId);
  } else {
    if (!user || !opponent) throw new Error("Invariant error");
    game = await getOrCreateLiveGame(gameId, user, opponent);
  }

  const resetCount = await getGameResetCount(gameId);

  const solved = game.won();
  const lost = game.answers.length >= 6 && !solved;

  return new Response(
    JSON.stringify({
      gameId,
      guesses: game.guesses,
      answers: game.answers,
      answer: game.answers.length >= 6 ? game.answer : null,
      solved,
      lost,
      resetCount,
    })
  );
};
