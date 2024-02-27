<script>
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import Puzzly from "$lib/icons/puzzly.svelte";
  import { mud, user } from "$lib/mud/mudStore";

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    // const wallet = userWallet.tryConnect();
    await mud.setup(wallet);
  };
</script>

<svelte:head>
  <title>Puzzle Bets | Welcome</title>
  <meta name="description" content="Solve puzzles with friends" />
</svelte:head>

<div class="flex flex-col gap-24 items-center justify-evenly flex-grow">
  <div class="flex flex-col gap-1 items-center">
    <div class="p-4">
      <div class="h-28 w-28 fill-off-black">
        <Puzzly />
      </div>
    </div>
    <div class="text-off-black text-xl sm:text-2xl font-bold">
      Welcome to Puzzle Bets.
    </div>
    <div class="text-gray-400">Play puzzles, bet with friends</div>
  </div>
  <div class="text-sm sm:text-base flex flex-col gap-2 items-center">
    {#if !$user}
      <button
        on:click={loginAndConnect}
        class="p-3 text-white bg-lime-500 font-semibold hover:bg-lime-400 active:bg-lime-600 hover:shadow transition-all duration-300 rounded-xl"
      >
        Connect to Play
      </button>

      <div class="text-gray-400 text-xs">or</div>
    {/if}

    <button class="font-semibold text-gray-500 flex items-center">
      Learn more
      <AnimatedArrow
        direction="down"
        klass="h-5 w-5 fill-gray-600 stroke-gray-400"
      />
    </button>
  </div>
</div>
