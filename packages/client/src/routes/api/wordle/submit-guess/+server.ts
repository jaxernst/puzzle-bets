import { supabaseGameStore } from "$lib/server/gameStore";
import { Game } from "../../../games/wordle/game.server";

export const POST = async ({ request }): Promise<Response> => {
  const params = await request.json();
  const guess = params?.guess;
  const gameId = params?.gameId;
  const user = params.user;

  if (!gameId || !guess) {
    return new Response("Missing game ID or guess", { status: 400 });
  }

  const gameState = await supabaseGameStore.getGame("wordle", gameId, user);
  const game = new Game(gameState);

  const valid = game.enter(guess);
  await supabaseGameStore.setGame(game.toString(), "wordle", gameId, user);

  return new Response(
    JSON.stringify({
      gameId,
      guesses: game.guesses,
      answers: game.answers,
      answer: game.answers.length >= 6 ? game.answer : null,
      badGuess: !valid,
    })
  );
};
