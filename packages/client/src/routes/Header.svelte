<script>
  import WalletIcon from "$lib/icons/Wallet.svelte";
  import { mud } from "$lib/mud/mudStore";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import { userWallet } from "$lib/mud/connectWallet";
  import { shortenAddress } from "$lib/util";

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    mud.setup(wallet);
  };
</script>

<header class="p-5 flex justify-between relative">
  <div />
  <div class="flex-shrink text-2xl text-gray-500 font-semibold">
    Puzzle Bets
  </div>
  <div class="flex justify-end items-center">
    <button class="flex stroke-gray-500" on:click={() => loginAndConnect()}>
      <div class="w-6 h-6">
        <WalletIcon />
      </div>
      {#if $userWallet && $mud.ready}
        <div class="w-2 h-2 rounded-full bg-green-500"></div>
      {/if}
    </button>
  </div>
</header>
