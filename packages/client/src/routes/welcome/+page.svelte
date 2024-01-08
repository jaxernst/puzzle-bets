<script>
  import puzzly from "$lib/assets/puzzly.png";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import { mud } from "$lib/mud/mudStore";

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    mud.setup(wallet);
  };
</script>

<div class="flex flex-col gap-10 flex-grow">
  <div class="flex justify-center items-center">
    <div class="w-[50px] h-[50px] flex jutify-center">
      <img src={puzzly} alt="puzzly" />
    </div>
    <div class="text-center text-2xl font-bold">Welcome to Puzzle Bets.</div>
  </div>
  <div class="flex px-6">
    <div class="flex flex-col font-semibold">
      <div class="flex gap-3 items-center">
        <div class="w-3 h-[.3rem] rounded-full bg-lime-500"></div>
        <div>Challenge friends to puzzles</div>
      </div>
      <div class="flex gap-3 items-center">
        <div class="w-3 h-[.3rem] rounded-full bg-lime-500"></div>
        <div>Set your wager</div>
      </div>
      <div class="flex gap-3 items-center">
        <div class="w-3 h-[.3rem] rounded-full bg-lime-500"></div>
        <div>Solve the puzzle before the deadline to win.</div>
      </div>
    </div>
  </div>
  <div class="flex-grow flex flex-col items-center h-full justify-end">
    <button
      on:click={loginAndConnect}
      class="p-3 font-semibold border-2 border-lime-500 hover:bg-lime-500 hover:shadow transition-all duration-300 rounded-xl text-white"
    >
      Connect your wallet and choose a puzzle to begin.
    </button>
  </div>
</div>
