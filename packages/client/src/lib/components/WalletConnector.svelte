<script context="module" lang="ts">
  import { userWallet } from "$lib/mud/connectWallet";
  import { mud } from "$lib/mud/mudStore";
  import { shortenAddress } from "$lib/util";
  import { get, writable } from "svelte/store";
  import { fade } from "svelte/transition";
  import Modal from "./Modal.svelte";
  import type { Wallet } from "$lib/mud/setupNetwork";
  import Google from "$lib/icons/Google.svelte";
  import Apple from "$lib/icons/Apple.svelte";

  const showModal = writable(false);

  export const loginAndConnect = async () => {
    const wallet = await promptConnectWallet();
    await mud.setup(wallet);
  };

  export async function promptConnectWallet() {
    showModal.set(true);

    return new Promise<Wallet>(async (resolve, reject) => {
      userWallet.subscribe((wallet) => {
        if (wallet) setTimeout(() => resolve(wallet), 1000);
      });

      showModal.subscribe((show) => {
        if (!show && !get(userWallet)) {
          reject("No wallet connected");
        }
      });
    });
  }

  const connectWallet = async (authMethod: "google" | "apple" | "email") => {
    const wallet = await userWallet.tryConnect(authMethod);

    if (wallet) {
      showModal.set(false);
    }
  };
</script>

<Modal show={$showModal} on:close={() => ($showModal = false)} title="">
  <div
    class="relative z-10 min-w-[200px] min-h-[200px] bg-neutral-800 text-neutral-100 flex flex-col gap-4 justify-evenly items-center rounded-lg p-6"
  >
    <div class="font-bold pr-6">Puzzle Bets Wallet Sign In</div>

    <button
      class="absolute right-2 top-0 text-zinc-400 text-lg"
      on:click={() => showModal.set(false)}
    >
      x
    </button>

    <div></div>

    {#if $userWallet}
      <p class="flex-grow" transition:fade >
        Welcome {shortenAddress($userWallet?.account.address ?? "")}
      </p>
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
</Modal>
