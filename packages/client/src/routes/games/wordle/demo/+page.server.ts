import { fail } from "@sveltejs/kit";
import { Game } from "../game.server";
import type { PageServerLoad } from "./$types";
import { supabaseGameStore } from "$lib/server/gameStore";
import { generateRandomID } from "$lib/util";

export const load = (async ({ cookies }) => {
  let gameId = cookies.get("gameId");

  let gameState = "";
  if (!gameId) {
    gameId = generateRandomID(32);
    cookies.set("gameId", gameId, { path: "" });
    await supabaseGameStore.setGame("", "wordle", gameId);
  } else {
    // having a gameId set in cookies doesn't guarentee a gameId exists in the db
    const hasGame = await supabaseGameStore.hasGame("wordle", gameId);
    if (hasGame) {
      gameState = (await supabaseGameStore.getGame("wordle", gameId)) ?? "";
    } else {
      await supabaseGameStore.setGame("", "wordle", gameId);
    }
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
