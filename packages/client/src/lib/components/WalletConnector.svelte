<script context="module">
  import { userWallet } from "$lib/mud/connectWallet";
  import { mud } from "$lib/mud/mudStore";
  import { shortenAddress } from "$lib/util";
  import { get, writable } from "svelte/store";
  import { fade } from "svelte/transition";

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
    await new Promise((r) => setTimeout(r, 1000));

    if (wallet) {
      showModal.set(false);
    }
  };
</script>

{#if $showModal}
  <div
    class="absolute h-screen w-screen flex justify-center items-center bg-black bg-opacity-20"
  >
    <div
      class="relative z-10 min-w-[200px] min-h-[200px] bg-gray-50 flex flex-col gap-2 justify-evenly items-center rounded-lg p-6"
    >
      {#if $userWallet}
        <p transition:fade class={`text-lime-500 font-semibold`}>
          Welcome {shortenAddress($userWallet?.account.address ?? "")}
        </p>
      {:else}
        <div class="font-semibold text-lg text-zinc-400">
          Sign in to Puzzle Bets
        </div>
        <button
          on:click={connectWallet}
          class="bg-cyan-400 rounded-full px-2 py-1 text-white font-bold"
        >
          Connect
        </button>
      {/if}

      <button
        class="absolute right-2 top-2 text-lime-500 font-bold"
        on:click={() => showModal.set(false)}
      >
        x
      </button>
    </div>
  </div>
{/if}
