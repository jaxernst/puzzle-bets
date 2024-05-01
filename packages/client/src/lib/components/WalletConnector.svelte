<script context="module" lang="ts">
  import { walletStore } from "$lib/mud/connectWallet"
  import { mud } from "$lib/mud/mudStore"
  import { shortenAddress } from "$lib/util"
  import { get, writable } from "svelte/store"
  import Modal from "./Modal.svelte"
  import type { Wallet } from "$lib/mud/setupNetwork"
  import Google from "$lib/icons/Google.svelte"
  import Apple from "$lib/icons/Apple.svelte"
  import { browser } from "$app/environment"
  import DotLoader from "./DotLoader.svelte"
  import { networkConfig } from "$lib/mud/networkConfig"
  import ButtonPrimary from "./ButtonPrimary.svelte"
  import WalletIcon from "$lib/icons/Wallet.svelte"

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
    class="relative z-10 flex min-h-[200px] min-w-[220px] flex-col items-center gap-4 rounded-lg bg-neutral-800 p-6 text-neutral-100"
  >
    <div class="flex items-center gap-2 self-start pr-4 text-base font-bold">
      <WalletIcon class="h-5 w-5 stroke-white" />
      {#if $walletStore.account}
        Welcome {shortenAddress($walletStore?.account.address ?? "")}
      {:else}
        Wallet Sign In
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
          This is a testnet preview of Puzzle Bets. Click 'Connect' to create a
          temporary wallet auto-funded with testnet Ethereum (ETH).
        </div>

        <ButtonPrimary
          class="mb-2 mt-3 self-center rounded-full px-3 py-1"
          on:click={() => {
            walletStore.tryConnect("auto")
            showModal.set(false)
          }}
        >
          Connect
        </ButtonPrimary>
      {:else if $walletStore.connecting}
        <DotLoader />
      {:else if $walletStore.account}
        <div class="flex-grow" />
        <ButtonPrimary
          class="mb-2 mt-3 self-center rounded-full px-3 py-1"
          on:click={walletStore.disconnect}
        >
          Disconnect
        </ButtonPrimary>
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
