import {
  incrementGameResetCount,
  supabaseGameStore,
} from "$lib/server/gameStateStorage.js";
import { Game } from "../../../../lib/server/wordle/game.server";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
  const { gameId, user, otherPlayer, chainRematchCount } =
    (await request.json()) as {
      gameId: string;
      user?: string;
      otherPlayer?: string;
      chainRematchCount?: number;
    };

  const isDemoGame = !otherPlayer && !chainRematchCount;

  if (!gameId) return new Response("Missing game ID", { status: 400 });

  const gameExists = await supabaseGameStore.hasGame("wordle", gameId, user);
  if (!gameExists) return new Response("No game to reset", { status: 400 });

  // gameId's that are onchain (have an associated bet) can only be reset when
  // both players vote to reset. Will need to verify both players have voted
  // and reset each players game state
  // TODO: check if both players have voted
  // TODO: get 'otherPlayer' with a contract read
  // TODO: get 'chainRematchCount' with a contract read

  const game = new Game();
  await supabaseGameStore.setGame(game.toString(), "wordle", gameId, user);
  if (otherPlayer) {
    await supabaseGameStore.setGame(
      game.toString(),
      "wordle",
      gameId,
      otherPlayer
    );
  }

  const resetCount = await incrementGameResetCount(
    gameId,
    chainRematchCount,
    isDemoGame
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
