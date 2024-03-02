<script>
  import { page } from "$app/stores";
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import Puzzly from "$lib/icons/puzzly.svelte";
  import { mud, user } from "$lib/mud/mudStore";
  import { cubicOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    // const wallet = userWallet.tryConnect();
    await mud.setup(wallet);
  };

  $: path = $page.url.pathname;
</script>

<svelte:head>
  <title>Puzzle Bets | Welcome</title>
  <meta property="og:title" content="Puzzle Bets | Welcome" />
</svelte:head>

<div
  class="col-start-1 row-start-1 flex flex-col gap-24 items-center justify-evenly flex-grow"
  transition:fade={{ duration: 450, easing: cubicOut }}
>
  <div class="flex flex-col gap-1 items-center">
    <div class="p-4">
      <div class="h-28 w-28 fill-off-black">
        <Puzzly />
      </div>
    </div>
    <div class="text-off-black text-xl sm:text-2xl font-bold">
      Welcome to Puzzle Bets.
    </div>
    <div class="text-neutral-400">Play puzzles, compete with friends</div>
  </div>
  <div class="text-sm sm:text-base flex flex-col gap-2 items-center">
    {#if !$user}
      <button
        on:click={loginAndConnect}
        class="p-3 text-white bg-lime-500 font-semibold hover:bg-lime-400 active:bg-lime-600 hover:shadow transition-all duration-300 rounded-xl"
      >
        Connect to Play
      </button>

      <div class="text-neutral-400 text-xs">or</div>
    {/if}

    <a href="/about" class="font-semibold text-neutral-500 flex items-center">
      Learn more
      <AnimatedArrow
        direction={path === "/welcome" ? "down" : "up"}
        klass="h-5 w-5 fill-neutral-600 stroke-neutral-400"
      />
    </a>
  </div>
</div>
