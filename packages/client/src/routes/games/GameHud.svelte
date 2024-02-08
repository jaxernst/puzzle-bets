<script lang="ts">
  import { liveGameStatus, userGames, userSolvedGame } from "$lib/gameStores";
  import { formatTime, shortenAddress } from "$lib/util";
  import { type Entity } from "@latticexyz/recs";
  import { formatEther } from "viem";
  import { ethPrice } from "$lib/ethPrice";
  import { user } from "$lib/mud/mudStore";

  export let gameId: Entity;

  $: game = $userGames.find((g) => {
    return g.id === gameId;
  });

  $: liveStatus = liveGameStatus(gameId);

  $: betAmountEth = Number(formatEther(game?.buyInAmount ?? 0n));
  $: betAmountUsd = betAmountEth * $ethPrice;

  $: dueIn = $liveStatus?.submissionTimeLeft ?? 0;

  $: statusLabels = {
    0: () => "",
    1: () => "Invite Pending",
    2: () => {
      if ($userSolvedGame(gameId, $user)) {
        if (dueIn > 0) {
          return `Solution Received! Check back in ${formatTime(
            dueIn
          )} to claim rewards`;
        } else {
          return "Solution received!";
        }
      } else if (dueIn > 0) {
        return `Puzzle due in ${formatTime(dueIn)}`;
      } else {
        return "Time's up. No solution received";
      }
    },
    3: () => "Completed",
  };
</script>

{#if game}
  <div class="text-gray-400 font-semibold italic px-2 mb-2 sm:mb-4">
    {statusLabels[game.status]()}...
  </div>
  <div class="flex gap-4 items-stretch px-2">
    <div class="flex flex-col justify-evenly gap-1 font-semibold text-lime-500">
      <div class="">Wager</div>
      <div class="">Opponent</div>
    </div>
    <div class="flex flex-col justify-evenly gap-1 text-gray-100">
      <div class="text-gray-300">
        ${betAmountUsd.toFixed(2)}
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
