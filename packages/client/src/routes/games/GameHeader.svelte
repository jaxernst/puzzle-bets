<script lang="ts">
  import { loginAndConnect } from "$lib/components/WalletConnector.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import { type Entity, getComponentValue } from "@latticexyz/recs";
  import NewGameModal from "./NewGameModal.svelte";
  import type { Game, GameType } from "$lib/types";
  import { capitalized } from "$lib/util";

  export let gameType: GameType;
  export let gameId: Entity | null = null;

  let showNewGameModal = false;
</script>

<NewGameModal bind:show={showNewGameModal} {gameType} />

<div class="flex justify-between items-center">
  <div class="font-mono text-lg text-gray-100">
    {#if gameId}
      {capitalized(gameType)} game #{parseInt(gameId, 16)}
    {:else}
      {capitalized(gameType)}
    {/if}
  </div>

  <div class="flex flex-col gap-2">
    {#if !$user}
      <button
        class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
        on:click={loginAndConnect}
      >
        Connect to play
      </button>
    {:else if gameId}
      <button class="bg-lime-500 rounded-full px-2 py-1 font-semibold">
        Submit
      </button>
    {:else}
      <button
        class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
        on:click={() => (showNewGameModal = true)}
      >
        Start live game
      </button>
    {/if}
  </div>
</div>
