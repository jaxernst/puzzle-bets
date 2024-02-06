<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import WordleGame from "../WordleGame.svelte";
  import type { PageData } from "./$types";
  import { user } from "$lib/mud/mudStore";
  import { liveGameStatus, userGames, userSolvedGame } from "$lib/gameStores";
  import { GameStatus, type EvmAddress } from "$lib/types";

  export let gameState: null | {
    guesses: string[];
    answers: string[];
    answer: string | null;
    badGuess: boolean;
  } = null;

  const getOrCreateGame = async (user: string, opponent: string) => {
    const res = await fetch("/api/wordle/get-or-create-game", {
      method: "POST",
      body: JSON.stringify({ gameId: $page.params.gameId, user, opponent }),
    });

    if (!res.ok) return;
    gameState = await res.json();
  };

  $: onchainGame = $userGames.find(
    (g) => parseInt(g.id, 16).toString() === $page.params.gameId
  );

  $: if (
    !gameState &&
    $user &&
    onchainGame &&
    onchainGame.status === GameStatus.Active &&
    onchainGame.opponent
  ) {
    console.log("creating new game");
    getOrCreateGame($user, onchainGame.opponent);
  }

  const enterGuess = async (guess: string) => {
    const res = await fetch("/api/wordle/submit-guess", {
      method: "POST",
      body: JSON.stringify({ guess, gameId: $page.params.gameId, user: $user }),
    });

    if (!res.ok) return;
    gameState = await res.json();
  };

  $: gameOver =
    gameState &&
    (gameState.answers.length >= 6 || gameState.answers.at(-1) === "xxxxx");

  $: submitted = onchainGame && $userSolvedGame(onchainGame.id, $user);
  $: liveStatus = onchainGame && liveGameStatus(onchainGame.id);
  $: expired = liveStatus && !$liveStatus?.submissionTimeLeft;

  $: console.log($liveStatus);
</script>

{#if gameState}
  <WordleGame
    data={{
      guesses: gameState.guesses,
      answers: gameState.answers,
      answer: gameState.answer,
      badGuess: gameState.badGuess,
    }}
    on:submitGuess={(e) => {
      enterGuess(e.detail.guess);
    }}
  />
  {#if gameOver && !submitted && !expired}
    <div class="w-full text-center text-gray-400">
      Submit your solution before the deadline
    </div>
  {/if}
{/if}
