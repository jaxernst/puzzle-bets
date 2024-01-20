/**
 * Create a new game entry for a userAddress + gameId, or just   a userAddress
 */

import { supabaseGameStore } from "$lib/server/gameStore.js";

/** @type {import('./$types').RequestHandler} */
export const POST = async ({ request }) => {
  const { gameId, user } = (await request.json()) as {
    gameId: string;
    user?: string;
  };

  if (!gameId) return new Response("Missing game ID", { status: 400 });

  // gameId's that are onchain (have an associates bet) cannot be reset once already
  // created. (demo gameIds can)
  // TODO: check if gameId is onchain

  supabaseGameStore.setGame("", "wordle", gameId, user);

  return new Response(
    JSON.stringify({
      gameId: gameId,
      guesses: [],
      answers: [],
      answer: null,
      badGuess: false,
    })
  );
};
