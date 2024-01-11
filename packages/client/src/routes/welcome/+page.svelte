<script>
  import { goto } from "$app/navigation";
  import puzzly from "$lib/assets/puzzly.png";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import { userWallet } from "$lib/mud/connectWallet";
  import { mud, user } from "$lib/mud/mudStore";

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    await mud.setup(wallet);
    goto("/games/wordle");
  };
</script>

<div class="flex flex-col gap-6 items-center justify-center flex-grow">
  <div class="w-[60px] flex jutify-center">
    <img src={puzzly} alt="puzzly" />
  </div>
  <div class="flex flex-col gap-1 items-center">
    <div class="text-2xl font-bold">Welcome to Puzzle Bets.</div>
    <div class=" text-gray-400">Play puzzles, bet with friends</div>
  </div>
  <div class="p-10 flex flex-col items-center">
    {#if !$user}
      <button
        on:click={loginAndConnect}
        class="p-3 font-semibold border-2 border-lime-500 hover:bg-lime-500 hover:shadow transition-all duration-300 rounded-xl text-white"
      >
        Connect to Play
      </button>
    {:else}
      <div
        class="p-3 font-semibold border-2 border-lime-500 hover:bg-lime-500 hover:shadow transition-all duration-300 rounded-xl text-white"
      >
        Choose a game to play
      </div>
    {/if}
  </div>
  <div class="h-10"></div>
</div>
