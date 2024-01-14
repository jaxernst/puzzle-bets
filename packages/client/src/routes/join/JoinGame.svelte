<script lang="ts">
  import { page } from "$app/stores";
  import DotLoader from "$lib/components/DotLoader.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { mud } from "$lib/mud/mudStore";
  import { gameNumberToType, GameStatus, type GameType } from "$lib/types";
  import { capitalized, urlGameIdToEntity } from "$lib/util";
  import { getComponentValueStrict, type Entity } from "@latticexyz/recs";
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  export let gameId: Entity;

  let show = true;

  $: gameType =
    gameNumberToType[
      getComponentValueStrict($mud.components.GameType, gameId).value
    ];

  $: gameIsPending =
    getComponentValueStrict($mud.components.GameStatus, gameId).value ===
    GameStatus.Pending;

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
</script>

<div class="flex flex-col gap-2 max-w-[450px]">
  <div class="font-semibold">
    Join <span class="text-lime-500">{capitalized(gameType)}</span> Game #{parseInt(
      gameId,
      16
    )}
  </div>
  <div class="text-sm text-gray-100"></div>
  <div class="px-4 flex justify-center">
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
