import { supabaseGameStore } from "$lib/server/gameStore";
import { Game } from "../../../games/wordle/game.server";

export const POST = async ({ request }): Promise<Response> => {
  const { gameId, user } = (await request.json()) as {
    gameId: string;
    user?: string;
  };

  if (!gameId) return new Response("Missing game ID", { status: 400 });

  const hasGame = await supabaseGameStore.hasGame("wordle", gameId, user);
  let gameState = "";
  if (!hasGame) {
    await supabaseGameStore.setGame("", "wordle", gameId, user);
  } else {
    gameState = await supabaseGameStore.getGame("wordle", gameId, user);
  }

  const game = new Game(gameState);

  return new Response(
    JSON.stringify({
      gameCreated: !hasGame,
      gameId,
      guesses: game.guesses,
      answers: game.answers,
      answer: game.answers.length >= 6 ? game.answer : null,
      badGuess: false,
    })
  );
};
