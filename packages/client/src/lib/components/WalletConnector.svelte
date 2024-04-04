<script context="module" lang="ts">
  import { walletStore } from "$lib/mud/connectWallet";
  import { mud } from "$lib/mud/mudStore";
  import { shortenAddress } from "$lib/util";
  import { get, writable } from "svelte/store";
  import { fade } from "svelte/transition";
  import Modal from "./Modal.svelte";
  import type { Wallet } from "$lib/mud/setupNetwork";
  import Google from "$lib/icons/Google.svelte";
  import Apple from "$lib/icons/Apple.svelte";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import DotLoader from "./DotLoader.svelte";

  const showModal = writable(false);

  if (browser) {
    walletStore.tryConnect("auto").then((w) => {
      mud.setup(w);
    });
  }

  export const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    await mud.setup(wallet);
  };

  export async function promptConnectWallet() {
    showModal.set(true);

    return new Promise<Wallet>(async (resolve, reject) => {
      walletStore.subscribe((wallet) => {
        if (wallet) setTimeout(() => resolve(wallet), 1000);
      });

      showModal.subscribe((show) => {
        if (!show && !get(walletStore)) {
          reject("No wallet connected");
        }
      });
    });
  }

  const connectWallet = async (authMethod: "google" | "apple" | "email") => {
    const wallet = await walletStore.tryConnect(authMethod);

    if (wallet) {
      showModal.set(false);
    }
  };
</script>

<Modal show={$showModal} on:close={() => ($showModal = false)} title="">
  <div
    class="relative z-10 min-w-[200px] min-h-[200px] bg-neutral-800 text-neutral-100 flex flex-col gap-4 justify-evenly items-center rounded-lg p-6"
  >
    <div class="font-bold pr-6">
      {#if $walletStore.account}
        Welcome {shortenAddress($walletStore?.account.address ?? "")}
      {:else}
        Puzzle Bets Wallet Sign In
      {/if}
    </div>

    <button
      class="absolute right-2 top-0 text-zinc-400 text-lg"
      on:click={() => showModal.set(false)}
    >
      x
    </button>

    <div class="flex-grow flex flex-col gap-4 justify-center">
      {#if $walletStore.connecting}
        <DotLoader />
      {:else if $walletStore.account}
        <button
          class=" bg-lime-500 text-white font-semibold rounded-lg border border-lime-500 text-center py-1 px-2"
          on:click={walletStore.disconnect}
        >
          Disconnect
        </button>
      {:else}
        <div class="flex items-center justify-evenly w-full">
          <button
            on:click={() => connectWallet("google")}
            class="p-3 flex gap-2 text-sm items-center border border-neutral-500 hover:bg-lime-500 transition-colors rounded-lg text-neutral-400"
          >
            <div class="w-7 h-7">
              <Google />
            </div>
          </button>

          <button
            on:click={() => connectWallet("apple")}
            class="p-3 flex gap-2 txt-sm items-center border border-neutral-500 hover:bg-lime-500 transition-colors rounded-lg text-neutral-400"
          >
            <div class="w-7 h-7">
              <Apple />
            </div>
          </button>
        </div>

        <div
          class="flex justify-center gap-1 items-center text-neutral-400 w-full"
        >
          <div class="border-t-[.5px] border-neutral-400 w-1/3"></div>
          <div class="text-xs">or</div>
          <div class="border-t-[.5px] border-neutral-400 w-1/3"></div>
        </div>

        <input
          type="text"
          class="bg-transparent px-4 py-2 w-full rounded-lg border border-neutral-500"
          placeholder="Enter email address"
        />

        <button
          class="bg-lime-500 text-white font-semibold rounded-lg border border-lime-500 w-full text-center py-2"
        >
          Continue
        </button>
      {/if}
    </div>
  </div>
</Modal>
