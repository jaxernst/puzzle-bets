<script lang="ts">
  import { getGame, liveGameStatus, userSolvedGame } from "$lib/gameStores";
  import { user } from "$lib/mud/mudStore";
  import type { StartedGame } from "$lib/types";
  import { formatTime, shortenAddress } from "$lib/util";
  import type { Entity } from "@latticexyz/recs";
  import { onMount } from "svelte";

  export let gameId: Entity;

  $: game = $getGame(gameId, { expectStarted: true }) as
    | StartedGame
    | undefined;

  $: liveStatus = liveGameStatus(gameId);

  let timeLeft: number | null = null;
  onMount(() => {
    if (!(game?.startTime && game.submissionWindow)) return;
    const now = Date.now();
    const start = Number(game.startTime);
    const end = start + game.submissionWindow * 1000;
    timeLeft = Math.max(0, end - now);
  });

  $: p1Solved = $userSolvedGame(gameId, game?.p1);
  $: p2Solved = $userSolvedGame(gameId, game?.p2);

  $: p1Results = p1Solved
    ? "✅"
    : ($liveStatus?.submissionTimeLeft ?? 0) > 0
      ? "(pending)"
      : "❌";

  $: p2Results = p2Solved
    ? "✅"
    : ($liveStatus?.submissionTimeLeft ?? 0) > 0
      ? "(pending)"
      : "❌";

  let gameOutcome: "won" | "tied" | "lost" | null = "won";
</script>

<div class="bg-gray-600 p-5 rounded-xl flex flex-col gap-2 max-w-[450px]">
  {#if timeLeft !== null && game}
    {#if timeLeft > 0}
      {formatTime(timeLeft)}
    {:else}
      <div class="flex flex-col gap-4 font-semibold">
        <div class="text-lime-500">Game #{parseInt(gameId, 16)} Results</div>
        <div
          class="grid grid-cols-2 gap-2 p-1 justify-center w-fit self-center"
        >
          <div>{shortenAddress(game.p1)}</div>
          <div class="justify-self-end">{p1Results}</div>
          <div>{shortenAddress(game.p2)}</div>
          <div class="justify-self-end">{p2Results}</div>
        </div>
        <div class="p-1">
          {#if gameOutcome}
            {#if gameOutcome === "won"}
              <button class="bg-lime-500 rounded-lg p-2">
                You won! Click to claim your winnings
              </button>
            {:else if gameOutcome === "tied"}
              <button class="bg-lime-500 rounded-lg p-2">
                It's a tie! Click to withdraw your wager
              </button>
            {:else}
              You lost :( Your opponent won the pot
            {/if}
          {/if}
        </div>
      </div>
    {/if}
  {/if}
</div>
