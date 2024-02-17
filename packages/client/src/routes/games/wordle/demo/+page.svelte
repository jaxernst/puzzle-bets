<script lang="ts">
  import WordleGame from "../WordleGame.svelte";
  import { launchConfetti } from "$lib/components/Confetti.svelte";
  import { wordleGameStates } from "../../puzzleGameStates";
  import { generateRandomID } from "$lib/util";

  const storedGameId = localStorage.getItem("wordleDemoGameId");
  const gameId = storedGameId ?? generateRandomID(32);

  if (!storedGameId) {
    localStorage.setItem("wordleDemoGameId", gameId);
  }

  wordleGameStates.getOrCreate(gameId);

  $: game = $wordleGameStates.get(gameId);

  const enterGuess = async (guess: string) => {
    await wordleGameStates.enterGuess(gameId, guess);
    const puzzleState = $wordleGameStates.get(gameId);
    if (puzzleState?.solved) {
      launchConfetti();
    }
  };

  const reset = async () => {
    wordleGameStates.reset(gameId, false);
  };

  let showRestart = false;
</script>

{#if game}
  <WordleGame
    data={game}
    on:submitGuess={(e) => {
      enterGuess(e.detail.guess);
    }}
    on:gameOver={(e) => {
      showRestart = true;
    }}
  />
{/if}

{#if showRestart || game?.solved || game?.lost}
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
