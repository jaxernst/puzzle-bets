<script lang="ts">
  import DotLoader from "$lib/components/DotLoader.svelte";
  import { ethPrice } from "$lib/ethPrice";
  import { getGame, liveGameStatus, userSolvedGame } from "$lib/gameStores";
  import { user, mud } from "$lib/mud/mudStore";
  import type { StartedGame } from "$lib/types";
  import { capitalized, formatTime, shortenAddress } from "$lib/util";
  import type { Entity } from "@latticexyz/recs";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { formatEther } from "viem";

  export let gameId: Entity;

  $: game = $getGame(gameId, { expectStarted: true }) as StartedGame;

  $: potSizeUsd = Number(formatEther(game.betAmount)) * $ethPrice;
  $: liveStatus = liveGameStatus(gameId);

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

  $: gameActive = ($liveStatus?.submissionTimeLeft ?? 0) > 0;
  $: gameOutcome = (() => {
    if (p1Solved === p2Solved) return "tied";
    if (p1Solved) return $user === game.p1 ? "won" : "lost";
    if (p2Solved) return $user === game.p2 ? "won" : "lost";
    return null;
  })();

  let claimLoading = false;
  let claimError: string | null = null;
  $: claim = async () => {
    claimLoading = true;
    claimError = null;
    try {
      await $mud.systemCalls.claim(gameId);
    } catch (e: any) {
      claimError = e.shortMessage ?? "error occurred";
    } finally {
      claimLoading = false;
    }
  };
</script>

<div class="bg-gray-600 p-5 rounded-xl flex flex-col gap-2 max-w-[450px]">
  <div class="flex flex-col gap-4 font-semibold">
    <div class="flex justify-between items-center">
      <div class="">Game #{parseInt(gameId, 16)} Results</div>
      <div
        class="self-center py-1 px-3 text-lime-500 border border-lime-500 rounded-xl"
      >
        ${potSizeUsd} pot
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2 px-4 py-3 w-fit">
      <div>{shortenAddress(game.p1)}</div>
      <div class="justify-self-end text-pb-yellow">{p1Results}</div>
      <div>{shortenAddress(game.p2)}</div>
      <div class="justify-self-end text-pb-yellow">{p2Results}</div>
    </div>
    <div class="flex justify-center">
      {#if gameActive}
        <div class="text-gray-400 text-sm italic">
          {formatTime($liveStatus?.submissionTimeLeft ?? 0)} left...
        </div>
      {:else if gameOutcome === "lost"}
        You lost :( Your opponent won the pot
      {:else}
        <button
          class="bg-lime-500 rounded-lg p-2 self-center"
          on:click={claim}
          in:slide={{ axis: "x" }}
        >
          {#if claimLoading}
            <DotLoader />
          {:else if gameOutcome === "won"}
            You won! Click to claim your winnings
          {:else if gameOutcome === "tied"}
            It's a tie! Click to withdraw your wager
          {/if}
        </button>
        {#if claimError}
          <div class="text-red-500 text-sm">{claimError}</div>
        {/if}
      {/if}
    </div>
  </div>
</div>
