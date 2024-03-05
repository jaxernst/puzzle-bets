<script context="module">
  import { userWallet } from "$lib/mud/connectWallet";
  import { mud } from "$lib/mud/mudStore";
  import { shortenAddress } from "$lib/util";
  import { get, writable } from "svelte/store";
  import { fade } from "svelte/transition";
  import Modal from "./Modal.svelte";

  const showModal = writable(false);

  export const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    await mud.setup(wallet);
  };

  export async function promptConnectWallet() {
    showModal.set(true);

    return new Promise(async (resolve, reject) => {
      userWallet.subscribe((wallet) => {
        if (wallet) setTimeout(() => resolve(wallet), 1000);
      });

      showModal.subscribe((show) => {
        if (!show && !get(userWallet)) {
          reject();
        }
      });
    });
  }

  const connectWallet = async () => {
    const wallet = userWallet.tryConnect();

    if (wallet) {
      showModal.set(false);
    }
  };
</script>

<Modal show={$showModal} on:close={() => ($showModal = false)}>
  <div
    class="relative z-10 min-w-[200px] min-h-[200px] bg-neutral-800 text-neutral-100 flex flex-col gap-4 justify-evenly items-center rounded-lg p-6"
  >
    {#if $userWallet}
      <p transition:fade class={`font-semibold`}>
        Welcome {shortenAddress($userWallet?.account.address ?? "")}
      </p>
    {:else}
      <div class="font-semibold text-lg">Sign in to Puzzle Bets</div>
      <div class="mx-3 border-l px-1 border-neutral-600 max-w-[350px]">
        <div class="p-1 text-xs text-neutral-400">Testnet Sign In</div>
        <ul class="p-3 flex flex-col gap-2 text-sm text-neutral-300">
          <li class="ml-3 list-disc">
            Connecting will create an in-browser wallet and fund it with testnet
            eth (monopoly money)
          </li>
          <li class="ml-3 list-disc">
            Your games and account are specific to the browser you are currently
            on.
          </li>
          <li class="ml-3 list-disc">
            It is recommend to add Puzzle Bets to your mobile home screen for
            the best experience
          </li>
        </ul>
      </div>

      <button
        on:click={connectWallet}
        class="border border-lime-500 hover:bg-lime-500 transition-colors rounded-xl px-3 py-2 text-white font-bold"
      >
        Connect
      </button>
    {/if}

    <button
      class="absolute right-2 top-2 text-zinc-400 font-bold"
      on:click={() => showModal.set(false)}
    >
      x
    </button>
  </div>
</Modal>
