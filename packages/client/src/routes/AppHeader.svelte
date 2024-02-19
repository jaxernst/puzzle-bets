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
</script>

<div class="w-full flex justify-between items-center">
  <div
    class="flex sm:gap-2 items-center text-off-black fill-off-black stroke-red-500 font-bold text-lg sm:text-xl tracking-wider"
  >
    <a href="/welcome" class="h-11 w-11">
      <Puzzly />
    </a>
    <div style="line-height: 1em">
      {#if $user}
        <CopyableAddress address={$user}></CopyableAddress>
      {:else}
        <a href="/welcome"> Puzzle Bets </a>
      {/if}
    </div>
  </div>
  <div class="flex gap-1 sm:gap-3 justify-end items-center">
    {#if userBalance}
      <div class="flex gap-1 items-center">
        <div class="text-gray-600 font-mono text-sm sm:text-base">
          {userBalance}
        </div>
        <div class="fill-gray-600 w-4 h-4">
          <EthSymbol />
        </div>
      </div>
    {/if}
    <button class="flex" on:click={() => loginAndConnect()}>
      <div class="w-7 h-7 stroke-off-black">
        <WalletIcon />
      </div>
      {#if $userWallet && $mud.ready}
        <div class="w-[.4rem] h-[.4rem] rounded-full bg-green-500"></div>
      {/if}
    </button>
    {#if $user}
      <button class="flex" on:click={$notifications.toggle}>
        <div class="flex justify-center items-center h-7">
          <div
            class={`w-5 h-5 fill-gray-600 transition-colors
              ${$notifications.enabled ? "" : "opacity-50"} 
              ${$notifications.loading ? "animate-pulse" : ""}
            `}
          >
            <NotificationBell />
          </div>
        </div>
        {#if $notifications.enabled}
          <div class="w-[.4rem] h-[.4rem] rounded-full bg-green-500"></div>
        {/if}
      </button>
    {/if}
  </div>
</div>
