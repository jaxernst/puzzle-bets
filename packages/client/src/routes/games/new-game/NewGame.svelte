<script lang="ts">
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"
  import InputPage from "./InputPage.svelte"
  import ConfirmPage from "./ConfirmPage.svelte"
  import { newGame } from "./newGame"
  import { onDestroy } from "svelte"
  import { ethPrice } from "$lib/ethPrice"

  export let puzzleType: PuzzleType
  $: newGame.setParam("puzzleType", puzzleType)

  // Default eth wager to a prefixed usd amount
  newGame.setParam("wagerEth", 2.5 / $ethPrice)

  let showConfirm = false

  onDestroy(newGame.reset)
</script>

<div class="flex max-w-[450px] flex-col gap-2 rounded-xl bg-neutral-800 p-5">
  <div class="font-semibold">
    {#if showConfirm}
      Confirm your <span class="text-lime-500">{capitalized(puzzleType)}</span> game
      details
    {:else}
      Create a new <span class="text-lime-500">{capitalized(puzzleType)}</span> game
    {/if}
  </div>

  {#if showConfirm}
    <div class="text-sm text-neutral-100">
      This action will deposit your wager and create a new Puzzle Bet. You may
      cancel and withdraw up until your opponent joins.
    </div>
    <ConfirmPage onCancel={() => (showConfirm = false)} />
  {:else}
    <div class="text-sm text-neutral-200">
      - Enter your wager then send an invite link to your opponent. When they
      join the game, the puzzle will be revealed and the deadline clock will
      start ticking.
    </div>

    <div class="text-sm text-neutral-200">
      - The sole player to solve + submit before the deadline wins.
    </div>
    <InputPage onConfirm={() => (showConfirm = true)} />
  {/if}
</div>
