<script lagn="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { userGames } from "$lib/mud/gameStores";
  import { mud, user } from "$lib/mud/mudStore";
  import { GameStatus } from "$lib/types";
  import { shortenAddress } from "$lib/util";
  import { onMount } from "svelte";

  $: activeGames = $userGames;
  $: gameId = $page.params;

  $: console.log($page.params);
</script>

<div class="font-mono text-gray-100">
  <span class="text-lime-400">{activeGames.length}</span> Active Games
</div>
{#if activeGames.length}
  <div class="flex gap-2 items-center">
    {#each activeGames as { game, p1, p2, id }}
      {@const gameId = Number(id.toString()).toString()}
      {@const isActive = gameId == $page.params.gameId}
      <button
        class={`flex items-center gap-2 px-3 py-2 self-start rounded-lg text-white bg-lime-500 font-semibold text-center transition-all`}
        on:click={() => goto(`${$page.route.id}/${gameId}`)}
      >
        {game}
        <span>|</span>
        <span class="font-bold text-lg"> $1.21</span>
      </button>
    {/each}
  </div>
{/if}
