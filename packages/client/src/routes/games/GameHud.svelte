<script lang="ts">
  import { userGames } from "$lib/gameStores";
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

  $: betAmountEth = Number(formatEther(game?.betAmount ?? 0n));
  $: betAmountUsd = betAmountEth * $ethPrice;

  let dueIn: string;
  onMount(() => {
    setInterval(() => {
      if (game?.status !== GameStatus.Active || !game.startTime) return;

      const _dueIn =
        Number(game.startTime + BigInt(game.submissionWindow)) -
        systemTimestamp();

      dueIn = formatTime(_dueIn > 0 ? _dueIn : 0);
    }, 1000);
  });

  $: statusLabels = {
    0: "",
    1: "Invite Pending",
    2: `Puzzle due in ${dueIn}`,
    3: "Completed",
  };
</script>

{#if game}
  <div class="text-gray-400 font-semibold italic mb-3">
    {statusLabels[game.status]}...
  </div>
  <div class="flex gap-4 items-stretch">
    <div class="flex flex-col justify-evenly gap-1 font-semibold text-lime-500">
      <div class="">Opponent</div>
      <div class="">Wager</div>
    </div>
    <div class="flex flex-col justify-evenly gap-1 text-gray-100">
      <div class="text-gray-300">
        {shortenAddress(game?.opponent)}
      </div>
      <div class="text-gray-300">
        ${betAmountUsd}
        {@html "&#9670"}
        {formatEther(game?.betAmount)} eth
      </div>
    </div>
  </div>
{/if}
