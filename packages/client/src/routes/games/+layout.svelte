<script lang="ts">
  import { page } from "$app/stores";
  import { type GameType } from "$lib/types";
  import NewGameModal from "./NewGameModal.svelte";

  // $: Game = $page.params.game[0].toUpperCase() + $page.params.game.slice(1);
  $: game = $page.route.id?.split("/")[2] as GameType;
  $: gameId = $page.params.gameId;

  let showNewGameModal = false;
</script>

<svelte:head>
  <title>Puzzle Bets: {$page}</title>
  <meta name="description" content="Solve puzzles with friends" />
</svelte:head>

<NewGameModal bind:show={showNewGameModal} gameType={game} />

<div class="flex flex-col gap-2">
  <div class="flex justify-between items-center">
    <div class="font-mono text-lg text-gray-100">
      {#if gameId}
        Wordle game with jaxer.eth
      {:else}
        Wordle
      {/if}
    </div>
    <div class="flex flex-col gap-2">
      {#if gameId}
        <button class="bg-lime-500 rounded-full px-2 py-1 font-semibold">
          Submit
        </button>
      {:else}
        <button
          class="bg-lime-500 rounded-full px-2 py-1 font-semibold"
          on:click={() => (showNewGameModal = true)}
        >
          Start new game
        </button>
      {/if}
    </div>
  </div>

  {#key $page.route.id}
    <div>
      <slot />
    </div>
  {/key}
</div>
