<script lang="ts">
  import { browser } from "$app/environment"
  import Apple from "$lib/icons/Apple.svelte"
  import Google from "$lib/icons/Google.svelte"
  import { tw, walletStore } from "$lib/mud/connectWallet"
  import AnimatedArrow from "../AnimatedArrow.svelte"
  import { preAuthenticate } from "thirdweb/wallets/embedded"
  import ConfirmationCodeInput from "./ConfirmationCodeInput.svelte"

  export let onConnect: () => void = () => {}

  async function connectWallet(authMethod: "google" | "apple") {
    const wallet = await walletStore.tryConnect(authMethod)
    if (wallet) onConnect()
  }

  let emailInput: string
  async function startEmailVerification() {
    console.log("sending email to", emailInput)
    await preAuthenticate({
      client: tw,
      strategy: "email",
      email: emailInput,
    })

    showConfirmCode = true
  }

  let codeError = null
  async function connectWithEmailCode(code: string) {
    codeError = null

    try {
      await walletStore.tryConnect("email", {
        email: emailInput,
        verificationCode: code,
      })

      onConnect()
    } catch (e) {
      console.log(e)
    }
  }

  let showConfirmCode = false
</script>

<div class="flex flex-col items-center gap-4">
  <div class="flex w-full items-center justify-center gap-6">
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

  {#if showConfirmCode && emailInput}
    <div class="flex flex-col gap-1">
      <div class="text-center text-sm text-neutral-400">
        Enter the verification code sent to
        <div class="text-neutral-200">{emailInput}</div>
      </div>
      <div>
        <ConfirmationCodeInput length="6" onComplete={connectWithEmailCode} />
      </div>
    </div>
  {:else}
    <div
      class="mx-5 flex items-center gap-2 rounded-lg border border-neutral-500"
    >
      <div class="flex-grow">
        <input
          type="text"
          class="w-full border-none bg-transparent px-4 py-2 outline-none"
          placeholder="Enter email address"
          bind:value={emailInput}
        />
      </div>

      <div class="translate-y-[.065rem] px-1.5">
        <button
          on:click={startEmailVerification}
          class="rounded-md border-lime-500 bg-lime-500 px-1 py-1 text-center font-semibold text-white"
        >
          <AnimatedArrow
            direction="right"
            class="h-5 w-5 fill-white stroke-white"
          />
        </button>
      </div>
    </div>
  {/if}
</div>
