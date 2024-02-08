<script lang="ts">
  import WordleGame from "../WordleGame.svelte";
  import type { PageData } from "./$types";
  import { launchConfetti } from "$lib/components/Confetti.svelte";

  export let data: PageData & { badGuess?: boolean };

  const enterGuess = async (guess: string) => {
    const res = await fetch("/api/wordle/submit-guess", {
      method: "POST",
      body: JSON.stringify({ guess, gameId: data.gameId }),
    });

    if (!res.ok) return;

    data = await res.json();
    if (data.answers.at(-1) === "xxxxx") {
      launchConfetti();
    }
  };

  const reset = async () => {
    const res = await fetch("/api/wordle/reset-game", {
      method: "POST",
      body: JSON.stringify({ gameId: data.gameId }),
    });

    if (!res.ok) return;

    data = await res.json();
  };

  let showRestart = false;

  $: gameOver = data.answers.length >= 6 || data.answers.at(-1) === "xxxxx";
</script>

{#if data}
  <WordleGame
    data={{
      guesses: data.guesses,
      answers: data.answers,
      answer: data.answer,
      badGuess: data.badGuess,
    }}
    on:submitGuess={(e) => {
      enterGuess(e.detail.guess);
    }}
    on:gameOver={(e) => {
      showRestart = true;
    }}
  />
{/if}

{#if showRestart || gameOver}
  <div class="w-ful flex justify-center py-4">
    <button
      class="rounded-lg p-2 bg-lime-500 font-semibold"
      on:click={() => {
        reset();
        showRestart = false;
      }}
    >
      Restart Demo Game
    </button>
  </div>
{/if}
