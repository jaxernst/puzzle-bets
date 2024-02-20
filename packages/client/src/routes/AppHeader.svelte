<script lang="ts">
  import { mud, user } from "$lib/mud/mudStore";
  import WalletIcon from "$lib/icons/Wallet.svelte";
  import { userWallet } from "$lib/mud/connectWallet";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import Puzzly from "$lib/icons/puzzly.svelte";
  import EthSymbol from "$lib/icons/EthSymbol.svelte";
  import CopyableAddress from "$lib/components/CopyableAddress.svelte";
  import NotificationBell from "$lib/icons/NotificationBell.svelte";
  import { formatEther } from "viem";
  import { onMount } from "svelte";
  import { notifications } from "$lib/notifications/notificationStore";
  import { getPWADisplayMode, isIosSafari } from "$lib/util";

  let userBalance: string;
  onMount(() => {
    setInterval(async () => {
      if (!$user || !$mud?.ready) return;

      const balance = await $mud.network.publicClient.getBalance({
        address: $user,
      });

      userBalance = Number(formatEther(balance)).toFixed(4);
    }, 4000);
  });

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    mud.setup(wallet);
  };

  $: maybeToggleNotifications = () => {
    if ($notifications.enabled) return $notifications.toggle();

    // Before enabling notifications, make sure device supports it. If we're on
    // ios safari, we need to be in standalone mode
    if (isIosSafari() && getPWADisplayMode() === "browser") {
      alert(
        "Please install the app to enable notifications. You can do this by clicking the 'Add to Home Screen' button in your browser."
      );
      return;
    }

    $notifications.toggle();
  };
</script>

<div class="w-full flex justify-between items-center">
  <div
    class="flex items-center text-off-black font-bold text-lg sm:text-xl tracking-wide"
  >
    <a href="/welcome" class="h-10 w-10 sm:h-11 sm:w-11 fill-off-black">
      <Puzzly />
    </a>
    <div style="line-height: 1em">
      {#if $user}
        <div class="text-base sm:text-lg">
          <CopyableAddress address={$user}></CopyableAddress>
        </div>
      {:else}
        <a class="px-1" href="/welcome"> Puzzle Bets </a>
      {/if}
    </div>
  </div>
  <div class="flex gap-2 sm:gap-3 justify-end items-center">
    {#if userBalance}
      <div class="flex gap-1 items-center">
        <div class="text-off-black font-mono text-sm sm:text-base">
          {userBalance}
        </div>
        <div class="fill-off-black w-4 h-4">
          <EthSymbol />
        </div>
      </div>
    {/if}
    <button
      class="flex h-7 items-center justify-center"
      on:click={() => loginAndConnect()}
    >
      <div class="h-6 w-6 stroke-off-black">
        <WalletIcon />
      </div>
      {#if $userWallet && $mud.ready}
        <div
          class="self-start w-[.4rem] h-[.4rem] rounded-full bg-green-500"
        ></div>
      {/if}
    </button>
    {#if $user}
      <button
        class="h-7 flex items-center justify-center"
        on:click={maybeToggleNotifications}
      >
        <div
          class={`w-5 h-5 fill-off-black/90 transition-colors
              ${$notifications.enabled ? "" : "opacity-50"} 
              ${$notifications.loading ? "animate-pulse" : ""}
            `}
        >
          <NotificationBell />
        </div>
        {#if $notifications.enabled}
          <div
            class="self-start w-[.4rem] h-[.4rem] rounded-full bg-green-500"
          ></div>
        {/if}
      </button>
    {/if}
  </div>
</div>
