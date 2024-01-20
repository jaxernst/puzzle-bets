<script lang="ts">
  import { onMount } from "svelte";
  import WordleGame from "../WordleGame.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  const enterGuess = async (guess: string) => {
    const res = await fetch("/api/wordle/submit-guess", {
      method: "POST",
      body: JSON.stringify({ guess, gameId: data.gameId }),
    });

    if (!res.ok) return;

    data = await res.json();
  };

  const reset = async () => {
    const res = await fetch("/api/wordle/new-game", {
      method: "POST",
      body: JSON.stringify({ gameId: data.gameId }),
    });

    if (!res.ok) return;

    data = await res.json();
  };
</script>

{#if data}
  <WordleGame
    data={{
      guesses: data.guesses,
      answers: data.answers,
      answer: data.answer,
      badGuess: data.badGuess,
    }}
    on:restart={reset}
    on:submitGuess={(e) => {
      enterGuess(e.detail.guess);
    }}
  />
{/if}
