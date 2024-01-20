<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import WordleGame from "../WordleGame.svelte";
  import type { PageData } from "./$types";
  import { user } from "$lib/mud/mudStore";
  import { userGames } from "$lib/gameStores";
  import { GameStatus } from "$lib/types";

  export let gameState: null | {
    guesses: string[];
    answers: string[];
    answer: string;
    badGuess: boolean;
  } = null;

  const getOrCreateGame = async () => {
    const res = await fetch("/api/wordle/get-or-create-game", {
      method: "POST",
      body: JSON.stringify({ gameId: $page.params.gameId, user: $user }),
    });

    if (!res.ok) return;
    gameState = await res.json();
  };

  // TODO: Should only create a new game in the db if the game status is active
  $: canMakeNewGame = $userGames.some((g) => {
    return (
      parseInt(g.id, 16).toString() === $page.params.gameId &&
      g.status === GameStatus.Active
    );
  });

  $: if (!gameState && canMakeNewGame) {
    console.log("creating new game");
    getOrCreateGame();
  }

  const enterGuess = async (guess: string) => {
    const res = await fetch("/api/wordle/submit-guess", {
      method: "POST",
      body: JSON.stringify({ guess, gameId: $page.params.gameId, user: $user }),
    });

    if (!res.ok) return;
    gameState = await res.json();
  };
</script>

{#if gameState}
  <WordleGame
    data={{
      guesses: gameState.guesses,
      answers: gameState.answers,
      answer: gameState.answer,
      badGuess: gameState.badGuess,
    }}
    on:restart={() => {}}
    on:submitGuess={(e) => {
      enterGuess(e.detail.guess);
    }}
  />
{/if}
