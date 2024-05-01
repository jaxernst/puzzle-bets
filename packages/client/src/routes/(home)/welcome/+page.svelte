<script>
  import { page } from "$app/stores"
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte"
  import DotLoader from "$lib/components/DotLoader.svelte"
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte"
  import { walletStore } from "$lib/mud/connectWallet"
  import { mud } from "$lib/mud/mudStore"
  import { user } from "$lib/user"
  import { cubicOut } from "svelte/easing"
  import { fade } from "svelte/transition"
  import ButtonPrimary from "$lib/components/ButtonPrimary.svelte"
  import Puzzly from "$lib/icons/Puzzly.svelte"

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet()
    // const wallet = walletStore.tryConnect();
    await mud.setup(wallet)
  }

  $: path = $page.url.pathname
</script>

<svelte:head>
  <title>Puzzle Bets | Welcome</title>
  <meta property="og:title" content="Puzzle Bets | Welcome" />
  <meta
    property="og:description"
    content="Challenge your friends, solve puzzles"
  />
</svelte:head>

<div
  class="col-start-1 row-start-1 flex flex-grow flex-col items-center justify-evenly gap-24"
  transition:fade={{ duration: 450, easing: cubicOut }}
>
  <div class="flex flex-col items-center gap-1">
    <div class="p-4">
      <Puzzly class="fill-off-black h-28 w-28" />
    </div>
    <div class="text-off-black relative text-xl font-bold sm:text-2xl">
      Welcome to Puzzle Bets.
      <div
        in:fade={{ duration: 500, delay: 600 }}
        class="absolute -right-10 -top-5 rotate-12 font-mono text-[.6rem]"
      >
        (Testnet beta)
      </div>
    </div>
    <div class="text-neutral-400">Play puzzles, compete with friends</div>
  </div>
  <div class="flex flex-col items-center gap-2 text-sm sm:text-base">
    {#if !$user.address}
      <ButtonPrimary
        on:click={loginAndConnect}
        class="rounded-xl p-3 hover:shadow"
      >
        {#if $walletStore.connecting}
          <DotLoader />
        {:else}
          Connect to Play
        {/if}
      </ButtonPrimary>

      <div class="text-xs text-neutral-400">or</div>
    {/if}

    <a href="/about" class="flex items-center font-semibold text-neutral-500">
      Learn more
      <AnimatedArrow
        direction={path === "/welcome" ? "down" : "up"}
        class="h-5 w-5 fill-neutral-600 stroke-neutral-400"
      />
    </a>
  </div>
</div>
