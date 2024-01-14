<script lang="ts">
  import { page } from "$app/stores";
  import Modal from "$lib/components/Modal.svelte";
  import { mud } from "$lib/mud/mudStore";
  import { gameNumberToType, GameStatus, type GameType } from "$lib/types";
  import { capitalized, urlGameIdToEntity } from "$lib/util";
  import { getComponentValueStrict, type Entity } from "@latticexyz/recs";
  import { createEventDispatcher } from "svelte";

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
</script>

<div class="flex flex-col gap-2 max-w-[450px]">
  <div class="font-semibold">
    Join <span class="text-lime-500">{capitalized(gameType)}</span> Game #{parseInt(
      gameId,
      16
    )}
  </div>
  <div class="text-sm text-gray-100"></div>
  <div class="px-4">
    <button
      class="bg-lime-500 text-white rounded-lg p-2"
      on:click={() =>
        $mud.systemCalls.joinGame(gameId).then(() => dispatch("joined"))}
    >
      Join to Reveal Puzzle
    </button>
  </div>
</div>
