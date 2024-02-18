import { supabaseGameStore } from "$lib/server/gameStateStorage";
import { Game } from "../../../../lib/server/wordle/game.server";

export const getOrCreateDemo = async (gameId: string, user?: string) => {
  const hasGame = await supabaseGameStore.hasGame("wordle", gameId, user, true);

  if (hasGame) {
    const gameState = await supabaseGameStore.getGame(
      "wordle",
      gameId,
      user,
      true
    );
    return new Game(gameState);
  } else {
    const game = new Game();
    await supabaseGameStore.setGame(
      game.toString(),
      "wordle",
      gameId,
      user,
      true
    );
    return game;
  }
};

export const getOrCreateLiveGame = async (
  gameId: string,
  user: string,
  opponent: string
) => {
  const userHasGame = await supabaseGameStore.hasGame("wordle", gameId, user);
  if (userHasGame) {
    const gameState = await supabaseGameStore.getGame("wordle", gameId, user);
    return new Game(gameState);
  }

  let game = new Game();
  const opponentHasGame = await supabaseGameStore.hasGame(
    "wordle",
    gameId,
    opponent
  );

  // If the opponent has a game entry (and user does not), create a new game entry
  // for the user with the same solution index (ensures same solution for both players)
  if (opponentHasGame) {
    const gameState = await supabaseGameStore.getGame(
      "wordle",
      gameId,
      opponent
    );

    const solutionIndex = gameState.split("-")[0];
    game = new Game(`${solutionIndex}-`);
  }

  await supabaseGameStore.setGame(game.toString(), "wordle", gameId, user);
  return game;
};
