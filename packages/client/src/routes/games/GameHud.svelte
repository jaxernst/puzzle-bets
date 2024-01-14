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
  <div class="flex flex-wrap gap-2">
    {#if game.opponent}
      <div class=" text-gray-100 rounded-lg px-2 py-1">
        <div class="text-sm text-lime-500 font-bold">Opponent</div>
        <div class="text-gray-300 font-semibold">
          {shortenAddress(game?.opponent)}
        </div>
      </div>
    {/if}
    <div class=" text-gray-100 rounded-lg px-2 py-1">
      <div class="text-sm text-lime-500 font-bold">Wager</div>
      <div class="text-gray-300 font-semibold">
        ${betAmountUsd}
        {@html "&#9670"}
        {formatEther(game?.betAmount)} eth
      </div>
    </div>
    <div class=" text-gray-100 rounded-lg px-2 py-1">
      <div class="text-sm text-lime-500 font-bold">Status</div>
      <div class="text-gray-300 font-semibold">{statusLabels[game.status]}</div>
    </div>
  </div>
{/if}
