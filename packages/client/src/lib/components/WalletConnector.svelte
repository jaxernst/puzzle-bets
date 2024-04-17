<script context="module" lang="ts">
  import { walletStore } from "$lib/mud/connectWallet"
  import { mud } from "$lib/mud/mudStore"
  import { shortenAddress } from "$lib/util"
  import { get, writable } from "svelte/store"
  import { fade } from "svelte/transition"
  import Modal from "./Modal.svelte"
  import type { Wallet } from "$lib/mud/setupNetwork"
  import Google from "$lib/icons/Google.svelte"
  import Apple from "$lib/icons/Apple.svelte"
  import { onMount } from "svelte"
  import { browser } from "$app/environment"
  import DotLoader from "./DotLoader.svelte"
  import { PUBLIC_CHAIN_ID } from "$env/static/public"
  import { networkConfig } from "$lib/mud/networkConfig"

  const showModal = writable(false)

  // Temp: don't autoconnect on lattice testnet with burner wallet
  if (browser && networkConfig.chainId !== 4242) {
    walletStore.tryConnect("auto").then((w) => {
      mud.setup(w)
    })
  }

  export const loginAndConnect = async () => {
    const wallet = await promptConnectWallet()
    await mud.setup(wallet)
  }

  export async function promptConnectWallet() {
    showModal.set(true)

    return new Promise<Wallet>(async (resolve, reject) => {
      walletStore.subscribe((wallet) => {
        if (wallet.account) setTimeout(() => resolve(wallet as Wallet), 1000)
      })

      showModal.subscribe((show) => {
        if (!show && !get(walletStore)) {
          reject("No wallet connected")
        }
      })
    })
  }

  const connectWallet = async (authMethod: "google" | "apple" | "email") => {
    const wallet = await walletStore.tryConnect(authMethod)

    if (wallet) {
      showModal.set(false)
    }
  }
</script>

<Modal show={$showModal} on:close={() => ($showModal = false)} title="">
  <div
    class="relative z-10 flex min-h-[200px] min-w-[200px] flex-col items-center gap-4 rounded-lg bg-neutral-800 p-6 text-neutral-100"
  >
    <div class="self-start font-bold">
      {#if $walletStore.account}
        Welcome {shortenAddress($walletStore?.account.address ?? "")}
      {:else}
        Puzzle Bets Wallet Sign In
      {/if}
    </div>

    <button
      class="absolute right-2 top-0 text-lg text-zinc-400"
      on:click={() => showModal.set(false)}
    >
      x
    </button>

    <div class="flex flex-grow flex-col justify-center gap-4">
      {#if !$walletStore.account && (networkConfig.chainId === 4242 || networkConfig.chainId === 31337)}
        <div
          class="max-w-[300px] border-l border-neutral-400 px-3 text-sm text-neutral-400"
        >
          This is a testnet preview of Puzzle bets. Connect to create a burner
          wallet and get it auto-funded with testnet eth!
        </div>
        <button
          class="mb-2 mt-3 self-center rounded-lg bg-lime-500 px-3 py-2 font-bold"
          on:click={() => {
            walletStore.tryConnect("auto")
            showModal.set(false)
          }}
        >
          Connect Burner
        </button>
      {:else if $walletStore.connecting}
        <DotLoader />
      {:else if $walletStore.account}
        <button
          class=" rounded-lg border border-lime-500 bg-lime-500 px-2 py-1 text-center font-semibold text-white"
          on:click={walletStore.disconnect}
        >
          Disconnect
        </button>
      {:else}
        <div class="flex w-full items-center justify-evenly">
          <button
            on:click={() => connectWallet("google")}
            class="flex items-center gap-2 rounded-lg border border-neutral-500 p-3 text-sm text-neutral-400 transition-colors hover:bg-lime-500"
          >
            <div class="h-7 w-7">
              <Google />
            </div>
          </button>

          <button
            on:click={() => connectWallet("apple")}
            class="txt-sm flex items-center gap-2 rounded-lg border border-neutral-500 p-3 text-neutral-400 transition-colors hover:bg-lime-500"
          >
            <div class="h-7 w-7">
              <Apple />
            </div>
          </button>
        </div>

        <div
          class="flex w-full items-center justify-center gap-1 text-neutral-400"
        >
          <div class="w-1/3 border-t-[.5px] border-neutral-400"></div>
          <div class="text-xs">or</div>
          <div class="w-1/3 border-t-[.5px] border-neutral-400"></div>
        </div>

        <input
          type="text"
          class="w-full rounded-lg border border-neutral-500 bg-transparent px-4 py-2"
          placeholder="Enter email address"
        />

        <button
          class="w-full rounded-lg border border-lime-500 bg-lime-500 py-2 text-center font-semibold text-white"
        >
          Continue
        </button>
      {/if}
    </div>
  </div>
</Modal>
