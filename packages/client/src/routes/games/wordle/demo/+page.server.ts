import { fail } from "@sveltejs/kit";
import { Game } from "../game.server";
import type { PageServerLoad } from "./$types";
import { supabaseGameStore } from "$lib/server/gameStore";
import { generateRandomID } from "$lib/util";
import { getOrCreateDemo } from "../../../api/wordle/get-or-create-game/getOrCreate";

export const load = (async ({ cookies }) => {
  let gameId = cookies.get("gameId");
  if (!gameId) {
    gameId = generateRandomID(32);
    cookies.set("gameId", gameId, { path: "" });
  }

  const game = await getOrCreateDemo(gameId);

  return {
    gameId,
    guesses: game.guesses,
    answers: game.answers,
    answer: game.answers.length >= 6 ? game.answer : null,
  };
}) satisfies PageServerLoad;
