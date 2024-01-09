<script lang="ts">
  import Modal from "$lib/components/Modal.svelte";
  import EthSymbol from "$lib/icons/EthSymbol.svelte";
  import { mud } from "$lib/mud/mudStore";
  import type { GameType } from "$lib/types";

  export let show = false;
  export let gameType: GameType;

  const capitalized = (str: string) => {
    return str
      .split(" ")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ");
  };

  let ethPrice = 2300;

  // Game params
  let wagerETH: number = 0.001;
  let wagerUSD: number = wagerETH * ethPrice;
  let submissionWindowMinutes = 15;
  let inviteExpirationMinutes = 20;

  function updateETH(value: number) {
    wagerETH = value;
    wagerUSD = wagerETH * ethPrice;
  }

  function updateUSD(value: number) {
    wagerUSD = value;
    wagerETH = wagerUSD / ethPrice;
  }

  async function createGame() {
    console.log("Creating game with wager", wagerETH);
    await $mud.systemCalls.newGame(
      gameType,
      wagerETH,
      submissionWindowMinutes,
      inviteExpirationMinutes
    );
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
    <div class="py-2 px-6 flex justify-between items-center text-gray-400">
      <label class="flex flex-col gap-1 text-gray-200">
        <span class="text-sm text-gray-400">Wager (ETH)</span>
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
      <div class="">or</div>
      <label class="flex flex-col gap-1 text-gray-200">
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
    <div class="py-2 px-6 flex flex-col gap-3">
      <div class="text-gray-400">
        Submission window:
        <input
          type="number"
          class="bg-gray-500 text-gray-200 rounded-lg w-[50px]"
          min="1"
          max="100000"
          bind:value={submissionWindowMinutes}
        /> minutes
      </div>
      <div class="text-gray-400">
        Invite expires:
        <input
          type="number"
          class="bg-gray-500 text-gray-200 rounded-lg w-[50px]"
          min="1"
          max="100000"
          bind:value={inviteExpirationMinutes}
        />
        minutes
      </div>
    </div>
    <div class="self-center p-4">
      <button
        class="bg-lime-500 hover:bg-lime-400 hover:shadow-lg transition-all active:bg-lime-600 rounded-lg font-bold px-3 py-2"
        on:click={createGame}
      >
        Create Game & Generate Invite
      </button>
    </div>
  </div>
</Modal>
