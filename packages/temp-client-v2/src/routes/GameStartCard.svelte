<script lang="ts">
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"

  export let game: PuzzleType
  export let disabled = false
</script>

<div class="h-[w-[260px] flex rounded-lg">
  <div class="bg-pb-yellow flex items-center">
    <div class="p-3 font-mono text-lg font-bold uppercase">
      {game[0]}
    </div>
  </div>
  <div class="bg-pb-bg-light flex flex-grow flex-col p-3">
    <div class="text-lg font-bold">{capitalized(game)}</div>
    {#if !disabled}
      <div class="self-start rounded-md bg-black p-2 text-white">
        Start game
      </div>
    {:else}
      <div class="bg-pb-gray self-start rounded-md p-2 text-white">
        Coming soon...
      </div>
    {/if}
  </div>
</div>
