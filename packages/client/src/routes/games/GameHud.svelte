<script lang="ts">
  import { liveGameStatus, userGames, userSolvedGame } from "$lib/gameStores";
  import { GameStatus } from "$lib/types";
  import { formatTime, shortenAddress, systemTimestamp } from "$lib/util";
  import { getComponentValueStrict, type Entity } from "@latticexyz/recs";
  import { formatEther } from "viem";
  import { ethPrice } from "$lib/ethPrice";
  import { onMount } from "svelte";

  export let gameId: Entity;

  $: game = $userGames.find((g) => {
    return g.id === gameId;
  });

  const liveStatus = liveGameStatus(gameId);

  $: betAmountEth = Number(formatEther(game?.betAmount ?? 0n));
  $: betAmountUsd = betAmountEth * $ethPrice;

  $: dueIn = $liveStatus?.submissionTimeLeft ?? 0;

  $: statusLabels = {
    0: () => "",
    1: () => "Invite Pending",
    2: () => {
      if ($userSolvedGame(gameId)) {
        return "Solution Received!";
      } else {
        return `Puzzle due in ${formatTime(dueIn)}`;
      }
    },
    3: () => "Completed",
  };
</script>

{#if game}
  <div class="text-gray-400 font-semibold italic px- mb-4">
    {statusLabels[game.status]()}...
  </div>
  <div class="flex gap-4 items-stretch px-2">
    <div class="flex flex-col justify-evenly gap-1 font-semibold text-lime-500">
      <div class="">Wager</div>
      <div class="">Opponent</div>
    </div>
    <div class="flex flex-col justify-evenly gap-1 text-gray-100">
      <div class="text-gray-300">
        ${betAmountUsd}
        {@html "&#9670"}
        {formatEther(game?.betAmount)} eth
      </div>
      <div class="text-gray-300">
        {#if game.opponent}
          {shortenAddress(game?.opponent)}
        {:else}
          ???
        {/if}
      </div>
    </div>
  </div>
{/if}
