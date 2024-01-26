<script lang="ts">
  import { page } from "$app/stores";
  import DotLoader from "$lib/components/DotLoader.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getGame } from "$lib/gameStores";
  import { mud } from "$lib/mud/mudStore";
  import { gameNumberToType, GameStatus, type GameType } from "$lib/types";
  import { ethPrice } from "$lib/ethPrice";
  import {
    capitalized,
    formatTime,
    shortenAddress,
    systemTimestamp,
    urlGameIdToEntity,
  } from "$lib/util";
  import { getComponentValueStrict, type Entity } from "@latticexyz/recs";
  import { createEventDispatcher, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";

  export let gameId: Entity;

  let show = true;

  $: game = $getGame(gameId);
  $: gameType = game?.type;

  const dispatch = createEventDispatcher();

  let joinGameLoading = false;
  const joinGame = async () => {
    joinGameLoading = true;
    try {
      await $mud.systemCalls.joinGame(gameId);
      dispatch("joined");
    } finally {
      joinGameLoading = false;
    }
  };

  let inviteExpiry: number | undefined;
  onMount(() =>
    setInterval(() => {
      if (!game) return;

      const tDiff = Number(game.inviteExpiration) - systemTimestamp();
      inviteExpiry = tDiff > 0 ? tDiff : 0;
    }, 1000)
  );
</script>

<div class="flex flex-col max-w-[450px]">
  <div class="font-semibold">
    Join <span class="text-lime-500">{capitalized(gameType)}</span> Game #{parseInt(
      gameId,
      16
    )}
  </div>

  {#if inviteExpiry}
    <div
      class="italic text-gray-400 whitespace-nowrap min-w-[270px]"
      in:slide={{ axis: "x", easing: cubicInOut }}
    >
      Invite expires in {formatTime(inviteExpiry)}...
    </div>
  {/if}

  <div class="text-sm text-gray-100 p-1">
    <div class="flex gap-4 py-4">
      <div class="flex flex-col gap-1 text-gray-400">
        <div class="">Game Creator</div>
        <div class="">Bet Amount</div>
        <div class="">Submission Window</div>
      </div>
      <div class="flex flex-col gap-1 text-gray-100">
        <div class="">{shortenAddress(game.p1)}</div>
        <div class="">
          {#if $ethPrice}
            ${Number(game.betAmount) * $ethPrice}
          {:else}
            {Number(game.betAmount) * $ethPrice} eth
          {/if}
        </div>
        <div class="">
          {Math.round(game.submissionWindow / 60)}<span>{" "}minutes</span>
        </div>
      </div>
    </div>
  </div>

  <div class="px-4 flex justify-center mt-2">
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
  </div>
</div>
