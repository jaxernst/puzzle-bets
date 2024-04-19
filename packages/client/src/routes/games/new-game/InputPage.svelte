<script lang="ts">
  import { ethPrice } from "$lib/ethPrice"
  import EthSymbol from "$lib/icons/EthSymbol.svelte"
  import { cubicOut } from "svelte/easing"
  import { slide } from "svelte/transition"
  import { NewGameStore } from "./NewGame.svelte"
  import { onMount } from "svelte"

  export let onConfirm: () => void

  // Game params
  let wagerUSD: number = 2.5
  onMount(() => {
    NewGameStore.setParam("wagerEth", wagerUSD / $ethPrice)
    NewGameStore.setParam("submissionWindow", 8 * 60)
    NewGameStore.setParam("inviteExpiration", 20 * 60)
  })

  let inviteName: string | null = null

  function updateETH(input: string) {
    const value = parseFloat(input)
    if (isNaN(value)) return

    wagerUSD = value * $ethPrice
    NewGameStore.setParam("wagerEth", value)
  }

  function updateUSD(input: string) {
    const value = parseFloat(input)
    if (isNaN(value)) return

    wagerUSD = value
    NewGameStore.setParam("wagerEth", wagerUSD / $ethPrice)
  }
</script>

<!-- Input fields -->
<div
  class="flex items-center justify-between px-2 py-2 text-neutral-400 sm:px-7"
>
  <label class="flex flex-col gap-1 text-neutral-200">
    <span class="text-sm text-neutral-400">Wager (USD)</span>
    <div class="flex items-center gap-1">
      <input
        type="number"
        min="5"
        step="1"
        class="w-[120px] rounded-lg bg-neutral-700 p-2"
        placeholder="15"
        value={wagerUSD}
        on:input={(event) => updateUSD(event.target.value)}
      />
      <div class=" fill-neutral-300">$</div>
    </div>
  </label>

  <div class="pt-3">or</div>

  <label class="flex flex-col gap-1 text-neutral-200">
    <span class="text-sm text-neutral-400">Wager (ETH)</span>
    <div class="flex items-center gap-1">
      <input
        type="number"
        min="0"
        step="0.001"
        class="w-[120px] rounded-lg bg-neutral-700 p-2"
        placeholder="0.01"
        value={$NewGameStore.wagerEth}
        on:input={(event) => updateETH(event.target.value)}
      />
      <div class="h-4 w-4 fill-neutral-300">
        <EthSymbol />
      </div>
    </div>
  </label>
</div>

<div class="flex flex-col gap-3 px-6 py-2">
  <div class="text-neutral-400">
    Puzzle deadline:
    <input
      type="number"
      class="w-[50px] rounded-lg bg-neutral-700 px-2 text-neutral-200"
      min="1"
      max="100000"
      value={$NewGameStore.submissionWindow / 60}
      on:input={(e) =>
        NewGameStore.setParam("submissionWindow", (e.target?.value ?? 0) * 60)}
    /> minutes
  </div>

  <div class="text-neutral-400">
    Invite expires:
    <input
      type="number"
      class="w-[50px] rounded-lg bg-neutral-700 px-2 text-neutral-200"
      min="1"
      max="100000"
      value={($NewGameStore.inviteExpiration ?? 0) / 60}
      on:input={(e) =>
        NewGameStore.setParam("inviteExpiration", (e.target?.value ?? 0) * 60)}
    />
    minutes
  </div>

  <div class="text-neutral-400">
    Your name (optional):
    <input
      type="text"
      class="w-[130px] rounded-lg border-2 border-neutral-500 bg-transparent px-2 text-neutral-200"
      bind:value={inviteName}
      on:input|preventDefault|stopPropagation
    />
  </div>
</div>

<button
  class="self-end whitespace-nowrap rounded-lg bg-lime-500 px-3 py-2 font-bold transition-all hover:bg-lime-400 hover:shadow-lg active:bg-lime-600"
  on:click={() => onConfirm()}
  in:slide={{ axis: "x", easing: cubicOut }}
>
  Confirm ->
</button>
