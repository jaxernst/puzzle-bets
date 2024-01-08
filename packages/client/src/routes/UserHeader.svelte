<script>
  import { mud, user } from "$lib/mud/mudStore";
  import profileBg from "$lib/assets/puzzly.png";
  import WalletIcon from "$lib/icons/Wallet.svelte";

  import { userWallet } from "$lib/mud/connectWallet";
  import { shortenAddress } from "$lib/util";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    mud.setup(wallet);
  };
</script>

<div class="w-full flex justify-between items-center">
  <a
    class="flex gap-2 items-center text-gray-600 font-bold text-xl tracking-wider"
    href="/welcome"
  >
    {#if $user}
      <img src={profileBg} class="h-11 w-11" alt="profile" />
      {shortenAddress($user)}
    {:else}
      Puzzle Bets
    {/if}
  </a>
  <div class="flex justify-end items-center">
    <button class="flex stroke-gray-600" on:click={() => loginAndConnect()}>
      <div class="w-7 h-7">
        <WalletIcon />
      </div>
      {#if $userWallet && $mud.ready}
        <div class="w-2 h-2 rounded-full bg-green-500"></div>
      {/if}
    </button>
  </div>
</div>
