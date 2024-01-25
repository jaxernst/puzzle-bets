<script>
  import { mud, user } from "$lib/mud/mudStore";
  import profileBg from "$lib/assets/puzzly.png";
  import WalletIcon from "$lib/icons/Wallet.svelte";

  import { userWallet } from "$lib/mud/connectWallet";
  import { shortenAddress } from "$lib/util";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import Puzzly from "$lib/icons/puzzly.svelte";

  const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    mud.setup(wallet);
  };
</script>

<div class="w-full flex justify-between items-center">
  <a
    class="flex gap-2 items-center text-off-black fill-off-black stroke-red-500 font-bold text-xl tracking-wider"
    href="/welcome"
  >
    <div class="h-11 w-11">
      <Puzzly />
    </div>
    {#if $user}
      {shortenAddress($user)}
    {:else}
      Puzzle Bets
    {/if}
  </a>
  <div class="flex justify-end items-center">
    <button class="flex" on:click={() => loginAndConnect()}>
      <div class="w-7 h-7 stroke-off-black">
        <WalletIcon />
      </div>
      {#if $userWallet && $mud.ready}
        <div class="w-2 h-2 rounded-full bg-green-500"></div>
      {/if}
    </button>
  </div>
</div>
