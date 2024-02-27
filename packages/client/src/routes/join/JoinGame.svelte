<script lang="ts">
  import DotLoader from "$lib/components/DotLoader.svelte";
  import { getGame, liveGameStatus } from "$lib/gameStores";
  import { mud } from "$lib/mud/mudStore";
  import { ethPrice } from "$lib/ethPrice";
  import {
    capitalized,
    formatAsDollar,
    formatTime,
    shortenAddress,
    systemTimestamp,
  } from "$lib/util";
  import { type Entity } from "@latticexyz/recs";
  import { createEventDispatcher, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import { formatEther } from "viem";

  export let gameId: Entity;

  $: game = $getGame(gameId);
  $: gameType = game?.type;

  const dispatch = createEventDispatcher();

  let joinGameLoading = false;
  const joinGame = async () => {
    if (!game) return;
    joinGameLoading = true;
    try {
      await $mud.systemCalls.joinGame(
        gameId,
        Number(formatEther(game?.buyInAmount))
      );
      dispatch("joined");

      fetch(`/api/notifications/${game.p1}/notify-game-joined`, {
        method: "POST",
      });
    } finally {
      joinGameLoading = false;
    }
  };

  $: liveStatus = liveGameStatus(gameId);
</script>

{#if game && gameType}
  <div class="flex flex-col max-w-[450px]">
    <div class="font-semibold">
      Join <span class="text-lime-500">{capitalized(gameType)}</span> Game #{parseInt(
        gameId,
        16
      )}
    </div>

    {#if $liveStatus?.inviteTimeLeft !== undefined}
      <div
        class="italic text-slate-400 whitespace-nowrap min-w-[270px]"
        in:slide={{ axis: "x", easing: cubicInOut }}
      >
        Invite expires in {formatTime($liveStatus.inviteTimeLeft)}...
      </div>
    {/if}

    <div class="text-sm text-slate-100 p-1">
      <div class="flex gap-4 py-4">
        <div class="flex flex-col gap-1 text-slate-400">
          <div class="">Game Creator</div>
          <div class="">Bet Amount</div>
          <div class="">Solution Deadline</div>
        </div>
        <div class="flex flex-col gap-1 text-slate-100">
          <div class="">{shortenAddress(game.p1)}</div>
          <div class="">
            {#if $ethPrice}
              {formatAsDollar(
                Number(formatEther(game.buyInAmount)) * $ethPrice
              )}
            {:else}
              {formatEther(game.buyInAmount)} eth
            {/if}
          </div>
          <div class="">
            {Math.round(game.submissionWindow / 60)}<span>{" "}minutes</span>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 flex justify-center mt-2">
      {#key joinGameLoading}
        <button
          in:slide={{ axis: "x" }}
          class="bg-lime-500 text-white rounded-lg p-2 whitespace-nowrap hover:bg-lime-400 hover:shadow transition-all"
          on:click={joinGame}
        >
          {#if joinGameLoading}
            <DotLoader />
          {:else}
            Join to Reveal Puzzle
          {/if}
        </button>
      {/key}
    </div>
  </div>
{/if}
