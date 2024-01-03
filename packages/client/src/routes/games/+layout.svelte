<script>
  import { page } from "$app/stores";

  // $: Game = $page.params.game[0].toUpperCase() + $page.params.game.slice(1);
  $: game = $page.route.id?.split("/")[2];
  let gameActive = true;
</script>

<svelte:head>
  <title>Puzzle Bets: {$page}</title>
  <meta name="description" content="Solve puzzles with friends" />
</svelte:head>

<div class="flex flex-col gap-2">
  <div class="flex justify-between items-center">
    <div class="font-mono text-lg text-gray-100">
      Wordle game with jaxer.eth
    </div>
    <div class="flex flex-col gap-2">
      <button class="bg-lime-500 rounded-full px-2 py-1 font-semibold">
        {#if gameActive}
          Submit (2min left)
        {:else}
          New Game dd
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
