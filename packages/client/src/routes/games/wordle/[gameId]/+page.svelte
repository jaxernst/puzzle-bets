<script context="module" lang="ts">
  import { type GameState } from "../types";
  import { writable } from "svelte/store";

  const gameStates = writable<Map<string, GameState>>(new Map());
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import WordleGame from "../WordleGame.svelte";
  import { user } from "$lib/mud/mudStore";
  import { liveGameStatus, userGames, userSolvedGame } from "$lib/gameStores";
  import { GameStatus, type EvmAddress } from "$lib/types";
  import { launchConfetti } from "$lib/components/Confetti.svelte";

  $: gameId = $page.params.gameId;
  $: gameState = $gameStates.get(gameId);

  $: onchainGame = $userGames.find(
    (g) => parseInt(g.id, 16).toString() === $page.params.gameId
  );

  $: getOrCreateGame = async (user: string, opponent: string) => {
    const res = await fetch("/api/wordle/get-or-create-game", {
      method: "POST",
      body: JSON.stringify({ gameId: $page.params.gameId, user, opponent }),
    });

    if (!res.ok) return;

    gameState = (await res.json()) as GameState;
    gameStates.update((s) => s.set(gameId, gameState!));
  };

  $: resetGame = async () => {
    const res = await fetch("/api/wordle/reset-game", {
      method: "POST",
      body: JSON.stringify({
        gameId: $page.params.gameId,
        user: $user,
        otherPlayer: onchainGame?.opponent,
        chainRematchCount: onchainGame?.rematchCount,
      }),
    });

    if (!res.ok) return;

    gameState = await res.json();
    gameStates.update((s) => s.set(gameId, gameState!));
  };

  $: if (!gameState && $user && onchainGame && onchainGame.opponent) {
    getOrCreateGame($user, onchainGame.opponent);
  }

  $: if (
    onchainGame &&
    gameState &&
    onchainGame.rematchCount > (gameState.resetCount ?? 1e10)
  ) {
    resetGame();
  }

  const enterGuess = async (guess: string) => {
    const res = await fetch("/api/wordle/submit-guess", {
      method: "POST",
      body: JSON.stringify({ guess, gameId: $page.params.gameId, user: $user }),
    });

    if (!res.ok) return;

    gameState = (await res.json()) as Omit<GameState, "resetCount">;
    gameStates.update((s) => {
      let resetCount = s.get(gameId)?.resetCount;
      return s.set(gameId, { ...gameState!, resetCount });
    });

    if (gameState?.answers.at(-1) === "xxxxx") {
      launchConfetti();
    }
  };

  $: gameOver =
    gameState &&
    (gameState.answers.length >= 6 || gameState.answers.at(-1) === "xxxxx");

  $: submitted = onchainGame && $userSolvedGame(onchainGame.id, $user);
  $: liveStatus = onchainGame && liveGameStatus(onchainGame.id);
  $: expired = liveStatus && !$liveStatus?.submissionTimeLeft;
  $: won = gameState?.answers.at(-1) === "xxxxx";
</script>

{#if gameState}
  <WordleGame
    data={{
      guesses: gameState.guesses,
      answers: gameState.answers,
      answer: gameState.answer,
      badGuess: gameState.badGuess,
    }}
    paused={Boolean(
      gameOver ||
        submitted ||
        expired ||
        onchainGame?.status !== GameStatus.Active
    )}
    on:submitGuess={(e) => {
      enterGuess(e.detail.guess);
    }}
  />
  {#if won && !submitted && !expired}
    <div class="w-full text-center text-gray-400">
      Submit your solution before the deadline
    </div>
  {/if}
{/if}
