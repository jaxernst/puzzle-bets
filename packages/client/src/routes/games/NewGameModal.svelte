<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import EthSymbol from "$lib/icons/EthSymbol.svelte";
  import type { GameType } from "$lib/types";
  import {
    Dialog,
    DialogOverlay,
    DialogDescription,
    DialogTitle,
  } from "@rgossiaux/svelte-headlessui";

  export let show = false;
  export let gameType: GameType;

  const capitalized = (str: string) => {
    return str
      .split(" ")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ");
  };

  let ethPrice = 2300;

  let wagerETH: number = 0.001;
  let wagerUSD: number = wagerETH * ethPrice;

  let lastUpdated = "ETH"; // Tracks which field was last updated

  function updateETH(value: number) {
    wagerETH = value;
    wagerUSD = wagerETH * ethPrice;
  }

  function updateUSD(value: number) {
    wagerUSD = value;
    wagerETH = wagerUSD / ethPrice;
  }
</script>

<Modal {show} on:close={() => (show = false)}>
  <div class="bg-gray-600 p-5 rounded-xl flex flex-col gap-2 max-w-[450px]">
    <div class="font-semibold">
      Create a new <span class="text-lime-500">{capitalized(gameType)}</span> Game
    </div>
    <div class="text-sm text-gray-100">
      Enter your wager then send an invite link to your opponent. When they join
      the game, the puzzle will be revealed and the submission window clock will
      start ticking.
    </div>
    <div class="p-2 flex justify-evenly items-center text-gray-400">
      <label class="p-2 flex flex-col gap-1 text-gray-200">
        <span class="text-sm text-gray-400">Wager (Eth)</span>
        <div class="flex items-center gap-1">
          <input
            type="number"
            min="0.000"
            step="0.001"
            class="bg-gray-500 rounded-lg p-2 w-[120px]"
            placeholder="0.01"
            value={wagerETH}
            on:input={(event) => updateETH(parseFloat(event.target.value))}
          />
          <div class="w-4 h-4 fill-gray-300">
            <EthSymbol />
          </div>
        </div>
      </label>
      <div class="pr-2">or</div>
      <label class="p-2 flex flex-col gap-1 text-gray-200">
        <span class="text-sm text-gray-400">Wager (USD)</span>
        <div class="flex items-center gap-1">
          <input
            type="number"
            min="5"
            step="1"
            class="bg-gray-500 rounded-lg p-2 w-[120px]"
            placeholder="15"
            value={wagerUSD}
            on:input={(event) => updateUSD(parseFloat(event.target.value))}
          />
          <div class=" fill-gray-300">$</div>
        </div>
      </label>
    </div>
    <div class="text-gray-400 self-center">Submission window: 15 minutes</div>
    <div class="self-center p-4">
      <button class="bg-lime-500 rounded-lg font-bold px-3 py-2">
        Create Game & Generate Invite
      </button>
    </div>
  </div>
</Modal>
