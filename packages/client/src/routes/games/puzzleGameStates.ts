import { getGame } from "$lib/gameStores";
import { user } from "$lib/mud/mudStore";
import type { EvmAddress, GameType } from "$lib/types";
import { intToEntity } from "$lib/util";

import { derived, get, writable, type Readable } from "svelte/store";

export interface PuzzleState {
  solved: boolean;
  lost: boolean;
}

export interface WordleGameState extends PuzzleState {
  guesses: string[];
  answers: string[];
  answer: string | null;
  badGuess: boolean;
  resetCount?: number;
}

type GameId = string;

export const wordleGameStates = (() => {
  const store = writable<Map<GameId, WordleGameState>>(new Map());

  // Opponent is temporary, and will eventually be retrieved in the backend
  const getOrCreate = async (
    gameId: GameId,
    isDemo: boolean,
    opponent?: EvmAddress
  ) => {
    const $user = get(user);

    const res = await fetch("/api/wordle/get-or-create-game", {
      method: "POST",
      body: JSON.stringify({ gameId, user: $user, opponent, isDemo }),
    });

    if (!res.ok) return;

    const gameState = (await res.json()) as WordleGameState;
    store.update((s) => s.set(gameId, gameState!));
  };

  let guessEntering = false;
  const enterGuess = async (gameId: GameId, guess: string, isDemo: boolean) => {
    if (guessEntering) return;

    const $user = get(user);

    guessEntering = true;
    try {
      const res = await fetch("/api/wordle/submit-guess", {
        method: "POST",
        body: JSON.stringify({
          guess,
          gameId,
          user: $user,
          isDemo,
        }),
      });

      if (!res.ok) return;

      const gameState = (await res.json()) as Omit<
        WordleGameState,
        "resetCount"
      >;
      store.update((s) => {
        let resetCount = s.get(gameId)?.resetCount;
        return s.set(gameId, { ...gameState!, resetCount });
      });
    } finally {
      guessEntering = false;
    }
  };

  const reset = async (gameId: GameId, isDemo: boolean) => {
    const $user = get(user);
    const game = isDemo ? undefined : get(getGame)(intToEntity(gameId, true));
    const opponent = game ? ($user === game.p1 ? game.p2 : game.p1) : undefined;

    const currentState = get(store).get(gameId);
    if (!currentState) return;

    // Prevent resetting offchain puzzle state more than onchain rematch count
    if (game && (currentState.resetCount ?? Infinity) >= game.rematchCount) {
      return;
    }

    const res = await fetch("/api/wordle/reset-game", {
      method: "POST",
      body: JSON.stringify({
        gameId,
        user: $user,
        otherPlayer: opponent,
        chainRematchCount: game?.rematchCount,
        isDemo,
      }),
    });

    if (!res.ok) return;

    const gameState = (await res.json()) as WordleGameState;
    store.update((s) => s.set(gameId, gameState));
  };

  return {
    ...store,
    getOrCreate,
    enterGuess,
    reset,
  };
})();

export const puzzleStores = derived(
  [wordleGameStates],
  ([$wordleGameStates]) => {
    return {
      wordle: $wordleGameStates,
      tradle: new Map(),
      crossword: new Map(),
      sudoku: new Map(),
    };
  }
) as Readable<Record<GameType, Map<GameId, PuzzleState>>>;
