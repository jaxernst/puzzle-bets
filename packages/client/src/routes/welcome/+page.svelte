<script>
  import { goto } from "$app/navigation";
  import puzzly from "$lib/assets/puzzly.png";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import Puzzly from "$lib/icons/puzzly.svelte";
  import { userWallet } from "$lib/mud/connectWallet";
  import { mud, user } from "$lib/mud/mudStore";
  import { onMount } from "svelte";

  const loginAndConnect = async () => {
    //const wallet = await promptConnectWallet();
    const wallet = userWallet.tryConnect();
    await mud.setup(wallet);
  };

  onMount(loginAndConnect);
</script>

<div class="flex flex-col gap-6 items-center justify-center flex-grow">
  <div class="w-[60px] flex jutify-center">
    <div class="w-[100px]"></div>
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
      <a
        class="p-3 font-semibold border-2 border-lime-500 hover:bg-lime-500 hover:shadow transition-all duration-300 rounded-xl text-white"
        href="/games/wordle/demo"
      >
        Choose a game to play
      </a>
    {/if}
  </div>
  <div class="h-10"></div>
</div>
