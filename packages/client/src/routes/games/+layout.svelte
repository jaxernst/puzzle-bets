<script>
  import { page } from "$app/stores";

  // $: Game = $page.params.game[0].toUpperCase() + $page.params.game.slice(1);
  $: gameName = $page.route.id?.split("/")[2];
  $: gameId = $page.params.gameId;
</script>

<svelte:head>
  <title>Puzzle Bets: {$page}</title>
  <meta name="description" content="Solve puzzles with friends" />
</svelte:head>

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
      <button class="bg-lime-500 rounded-full px-2 py-1 font-semibold">
        {#if gameId}
          Submit
        {:else}
          Start new game
        {/if}
      </button>
    </div>
  </div>

  {#key $page.route.id}
    <div>
      <slot />
    </div>
  {/key}
</div>
