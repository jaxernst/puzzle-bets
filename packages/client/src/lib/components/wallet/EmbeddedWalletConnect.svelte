<script lang="ts">
  import { browser } from "$app/environment"
  import Apple from "$lib/icons/Apple.svelte"
  import Google from "$lib/icons/Google.svelte"
  import { walletStore } from "$lib/mud/connectWallet"
  import { mud } from "$lib/mud/mudStore"
  import { networkConfig } from "$lib/mud/networkConfig"
  import { onMount } from "svelte"
  import AnimatedArrow from "../AnimatedArrow.svelte"
  import Modal from "../Modal.svelte"

  export let onConnect: () => void = () => {}

  const connectWallet = async (authMethod: "google" | "apple" | "email") => {
    const wallet = await walletStore.tryConnect(authMethod)
    if (wallet) onConnect()
  }

  let showModal = true
</script>

<div class="flex flex-col items-center gap-4">
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

  <div class="flex w-2/3 items-center justify-center gap-1 text-neutral-400">
    <div class="w-1/3 border-t-[.5px] border-neutral-400"></div>
    <div class="text-xs">or</div>
    <div class="w-1/3 border-t-[.5px] border-neutral-400"></div>
  </div>

  <div
    class="mx-5 flex items-center gap-2 rounded-lg border border-neutral-500"
  >
    <div class="flex-grow">
      <input
        type="text"
        class="w-full border-none bg-transparent px-4 py-2 outline-none"
        placeholder="Enter email address"
      />
    </div>

    <div class="translate-y-[.065rem] px-1.5">
      <button
        class="rounded-md border-lime-500 bg-lime-500 px-1 py-1 text-center font-semibold text-white"
      >
        <AnimatedArrow
          direction="right"
          class="h-5 w-5 fill-white stroke-white"
        />
      </button>
    </div>
  </div>
</div>
