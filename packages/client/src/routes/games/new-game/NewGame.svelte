<script lang="ts">
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"
  import InputPage from "./InputPage.svelte"
  import ConfirmPage from "./ConfirmPage.svelte"
  import { newGame } from "./newGame"

  export let puzzleType: PuzzleType
  $: newGame.setParam("puzzleType", puzzleType)

  let showConfirm = false
</script>

<div class="flex max-w-[450px] flex-col gap-2 rounded-xl bg-neutral-800 p-5">
  <div class="font-semibold">
    Create a new <span class="text-lime-500">{capitalized(puzzleType)}</span> Game
  </div>

  {#if showConfirm}
    <div class="text-sm text-neutral-100">
      Confirm your Puzzle Bet details. You may cancel the game to withdraw up
      until your opponent joins:
    </div>
    <ConfirmPage onCancel={() => (showConfirm = false)} />
  {:else}
    <div class="text-sm text-neutral-100">
      Enter your wager then send an invite link to your opponent. When they join
      the game, the puzzle will be revealed and the deadline clock will start
      ticking.
    </div>

    <InputPage onConfirm={() => (showConfirm = true)} />
  {/if}
</div>
