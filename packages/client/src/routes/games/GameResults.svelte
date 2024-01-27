<script lang="ts">
  import { getGame } from "$lib/gameStores";
  import { user } from "$lib/mud/mudStore";
  import type { StartedGame } from "$lib/types";
  import { formatTime, shortenAddress } from "$lib/util";
  import type { Entity } from "@latticexyz/recs";
  import { onMount } from "svelte";

  export let gameId: Entity;

  $: game = $getGame(gameId, { expectStarted: true }) as
    | StartedGame
    | undefined;

  let timeLeft: number | null = null;
  onMount(() => {
    if (!(game?.startTime && game.submissionWindow)) return;
    const now = Date.now();
    const start = Number(game.startTime);
    const end = start + game.submissionWindow * 1000;
    timeLeft = Math.max(0, end - now);
  });

  let p1Solved = false;
  let p2Solved = true;
  let gameOutcome: "won" | "tied" | "lost" | null = "won";
  $: if (timeLeft === 0) {
  }
</script>

<div class="bg-gray-600 p-5 rounded-xl flex flex-col gap-2 max-w-[450px]">
  {#if timeLeft !== null && game}
    {#if timeLeft > 0}
      {formatTime(timeLeft)}
    {:else}
      <div class="flex flex-col gap-2 font-semibold">
        <div class="text-lime-500">Game #{parseInt(gameId, 16)} results:</div>
        <div class="grid grid-cols-2 gap-2 p-1">
          <div>{shortenAddress(game.p1)}</div>
          <div>{p1Solved ? "✅" : "❌"}</div>
          <div>{shortenAddress(game.p2)}</div>
          <div>{p2Solved ? "✅" : "❌"}</div>
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
