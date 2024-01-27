<script lang="ts">
  import { loginAndConnect } from "$lib/components/WalletConnector.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import { type Entity, getComponentValue } from "@latticexyz/recs";
  import NewGameModal from "./NewGame.svelte";
  import { GameStatus, type Game, type GameType } from "$lib/types";
  import { capitalized } from "$lib/util";
  import { onDestroy } from "svelte";
  import Modal from "$lib/components/Modal.svelte";
  import GameResults from "./GameResults.svelte";
  import { getGame, liveGameStatus, type LiveStatus } from "$lib/gameStores";
  import { readable, writable, type Readable } from "svelte/store";

  export let gameType: GameType;
  export let gameId: Entity | null = null;

  let liveStatus: Readable<LiveStatus | null> = readable(null);
  $: game = gameId && $getGame(gameId);
  $: if (game) {
    liveStatus = liveGameStatus(game);
  } else {
    liveStatus = readable(null);
  }

  let showNewGameModal = false;
  let showResultsModal = false;
</script>

<Modal
  show={showNewGameModal}
  on:close={() => {
    showNewGameModal = false;
  }}
>
  <NewGameModal {gameType} />
</Modal>

{#if gameId}
  <Modal
    show={showResultsModal}
    on:close={() => {
      showResultsModal = false;
    }}
  >
    <GameResults {gameId} />
  </Modal>
{/if}

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
    {:else if !gameId}
      <button
        class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
        on:click={() => (showNewGameModal = true)}
      >
        Start live game
      </button>
    {:else if liveStatus && $liveStatus?.status === GameStatus.Complete}
      <button
        on:click={() => {
          showResultsModal = true;
        }}
        class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
      >
        View Results + Claim
      </button>
    {:else if $liveStatus?.status === GameStatus.Active}
      <button class="bg-lime-500 rounded-full px-2 py-1 font-semibold">
        Submit
      </button>
    {/if}
  </div>
</div>
