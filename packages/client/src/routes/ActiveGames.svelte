<script lagn="ts">
  import { userGames } from "$lib/mud/gameStores";
  import { mud, user } from "$lib/mud/mudStore";
  import {
    Has,
    HasValue,
    getComponentValueStrict,
    runQuery,
  } from "@latticexyz/recs";

  $: console.log(userGames);
</script>

<div class="font-mono text-gray-100">Active Games</div>
<div class="flex gap-2 items-center">
  {#each [{ name: "jaxer.eth", game: "Wordle" }] as { name, game }}
    <div
      class="flex items-center gap-2 px-3 py-2 self-start rounded-lg text-white bg-lime-500 font-semibold text-center transition-all"
    >
      {game}
      <span>|</span>
      {name}
      <span class="font-bold text-lg"> $1.21</span>
    </div>
  {/each}
</div>
