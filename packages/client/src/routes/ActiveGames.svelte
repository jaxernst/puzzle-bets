<script lagn="ts">
  import { userGames } from "$lib/mud/gameStores";
  import { mud, user } from "$lib/mud/mudStore";
  import { GameStatus } from "$lib/types";
  import { shortenAddress } from "$lib/util";

  $: activeGames = $userGames.filter(
    (g) => g.status.value === GameStatus.Active
  );
</script>

<div class="font-mono text-gray-100">
  <span class="text-lime-400">{activeGames.length}</span> Active Games
</div>
{#if activeGames.length}
  <div class="flex gap-2 items-center">
    {#each activeGames as { game, p1, p2 }}
      <div
        class="flex items-center gap-2 px-3 py-2 self-start rounded-lg text-white bg-lime-500 font-semibold text-center transition-all"
      >
        {game}
        <span>|</span>
        {$user === p1.value
          ? shortenAddress(p2.value)
          : shortenAddress(p1.value)}
        <span class="font-bold text-lg"> $1.21</span>
      </div>
    {/each}
  </div>
{/if}
