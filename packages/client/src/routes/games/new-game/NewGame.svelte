<script lang="ts">
  import type { PuzzleType } from "$lib/types"
  import { capitalized } from "$lib/util"
  import InputPage from "./NewGameInputs.svelte"
  import ConfirmPage from "./NewGameConfirm.svelte"
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
    <div class="text-neutral-200">
      <div class="flex gap-1">
        <span class="font-bold text-neutral-400">-</span> Choose your wager and bet
        parameters
      </div>
      <div class="flex gap-1">
        <span class="font-bold text-neutral-400">-</span> Invite a friend to your
        game or post it to the public lobby
      </div>
      <div class="flex gap-1">
        <span class="font-bold text-neutral-400">-</span> The sole player to solve
        + submit before the deadline wins.
      </div>
    </div>
    <InputPage onConfirm={() => (showConfirm = true)} />
  {/if}
</div>
