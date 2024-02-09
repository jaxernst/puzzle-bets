<script lang="ts">
  import { page } from "$app/stores";
  import WordleGame from "../WordleGame.svelte";
  import { user } from "$lib/mud/mudStore";
  import { liveGameStatus, userGames, userSolvedGame } from "$lib/gameStores";
  import { GameStatus, type EvmAddress } from "$lib/types";
  import { launchConfetti } from "$lib/components/Confetti.svelte";
  import { wordleGameStates } from "../../puzzleGameStates";

  $: gameId = $page.params.gameId;
  $: puzzleState = $wordleGameStates.get(gameId);

  $: onchainGame = $userGames.find(
    (g) => parseInt(g.id, 16).toString() === $page.params.gameId
  );

  $: if (!puzzleState && $user && onchainGame && onchainGame.opponent) {
    wordleGameStates.getOrCreate(gameId, onchainGame.opponent);
  }

  $: if (
    onchainGame &&
    puzzleState &&
    onchainGame.rematchCount > (puzzleState.resetCount ?? 1e10)
  ) {
    wordleGameStates.reset(gameId);
  }

  $: enterGuess = async (guess: string) => {
    await wordleGameStates.enterGuess(gameId, guess);
    const puzzleState = $wordleGameStates.get(gameId);
    if (puzzleState?.solved) {
      launchConfetti();
    }
  };

  $: gameOver = puzzleState?.solved || puzzleState?.lost;
  $: submitted = onchainGame && $userSolvedGame(onchainGame.id, $user);
  $: liveStatus = onchainGame && liveGameStatus(onchainGame.id);
  $: expired = liveStatus && !$liveStatus?.submissionTimeLeft;
</script>

{#if puzzleState}
  <WordleGame
    data={puzzleState}
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
  {#if puzzleState.solved && !submitted && !expired}
    <div class="w-full text-center text-gray-400">
      Submit your solution before the deadline
    </div>
  {/if}
{/if}
