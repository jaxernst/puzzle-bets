<script>
  import { mud, user } from "$lib/mud/mudStore";
  import WalletIcon from "$lib/icons/Wallet.svelte";
  import { userWallet } from "$lib/mud/connectWallet";
  import { shortenAddress } from "$lib/util";
  import { promptConnectWallet } from "$lib/components/WalletConnector.svelte";
  import Puzzly from "$lib/icons/puzzly.svelte";
  import EthSymbol from "$lib/icons/EthSymbol.svelte";

  $: userBalance =
    $user && $mud.network.publicClient.getBalance({ address: $user });

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
    <div style="line-height: 1em">
      {#if $user}
        {shortenAddress($user)}
      {:else}
        Puzzle Bets
      {/if}
    </div>
  </a>
  <div class="flex gap-3 justify-end items-center">
    {#await userBalance then balance}
      <div class="flex gap-1 items-center">
        <div class="text-gray-600">{balance}</div>
        <div class="fill-gray-600 w-4 h-4">
          <EthSymbol />
        </div>
      </div>
    {/await}
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
