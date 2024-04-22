<script lang="ts">
  import { ethPrice } from "$lib/ethPrice"
  import EthSymbol from "$lib/icons/EthSymbol.svelte"
  import { newGame } from "./newGame"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import ButtonPrimary from "$lib/components/ButtonPrimary.svelte"

  export let onConfirm: () => void

  let wagerUSD: number = $newGame.wagerEth * $ethPrice
  let inviteName: string | null = null

  function updateETH(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value)
    if (isNaN(value)) return

    wagerUSD = value * $ethPrice
    newGame.setParam("wagerEth", value)
  }

  function updateUSD(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value)
    if (isNaN(value)) return

    wagerUSD = value
    newGame.setParam("wagerEth", wagerUSD / $ethPrice)
  }

  function updateSubmissionWindow(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value)
    newGame.setParam("submissionWindow", value * 60)
  }

  function updateInviteExpiration(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value)
    newGame.setParam("inviteExpiration", value * 60)
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
        min="0"
        step="1"
        class="w-[120px] rounded-lg bg-neutral-700 p-2"
        placeholder="15"
        value={wagerUSD}
        on:input={updateUSD}
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
        value={$newGame.wagerEth}
        on:input={updateETH}
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
      value={$newGame.submissionWindow / 60}
      on:input={updateSubmissionWindow}
    /> minutes
  </div>

  <div class="text-neutral-400">
    Invite expires:
    <input
      type="number"
      class="w-[50px] rounded-lg bg-neutral-700 px-2 text-neutral-200"
      min="1"
      max="100000"
      value={($newGame.inviteExpiration ?? 0) / 60}
      on:input={updateInviteExpiration}
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

<ButtonPrimary class="self-end whitespace-nowrap" on:click={onConfirm}>
  <AnimatedArrow direction="right" klass="w-5 fill-white stroke-white" />
</ButtonPrimary>
