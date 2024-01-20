import { fail } from "@sveltejs/kit";
import { Game } from "../game.server";
import type { PageServerLoad } from "./$types";
import { supabaseGameStore } from "$lib/server/gameStore";
import { generateRandomID } from "$lib/util";

export const load = (async ({ cookies }) => {
  // The gameId for demo games is users IP address
  let gameId = cookies.get("gameId");
  let gameState = "";
  if (!gameId) {
    gameId = generateRandomID(32);
    cookies.set("gameId", gameId, { path: "" });
    await supabaseGameStore.setGame("wordle", gameId, "");
  } else {
    gameState = (await supabaseGameStore.getGame("wordle", gameId)) ?? "";
  }

  const game = new Game(gameState);

  return {
    gameId,
    guesses: game.guesses,
    answers: game.answers,
    answer: game.answers.length >= 6 ? game.answer : null,
    badGuess: false,
  };
}) satisfies PageServerLoad;
