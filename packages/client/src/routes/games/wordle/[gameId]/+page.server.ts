import { fail } from "@sveltejs/kit";
import { Game } from "../game.server";
import type { PageServerLoad } from "./$types";
import { supabaseGameStore } from "$lib/server/gameStateStorage";

/*
export const load = (async ({ params }) => {
  // The gameId for demo games is users IP address
  const gameState = await supabaseGameStore.getGame("wordle", params.gameId);

  const game = new Game(gameState);

  return {
    gameExists: gameState !== null,
    guesses: game.guesses,
    answers: game.answers,
    answer: game.answers.length >= 6 ? game.answer : null,
    badGuess: false,
  };
}) satisfies PageServerLoad;
*/
