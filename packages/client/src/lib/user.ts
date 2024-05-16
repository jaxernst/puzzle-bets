import { writable, get } from "svelte/store"
import { walletStore } from "$lib/mud/connectWallet"
import { formatEther, type Account } from "viem"
import { mud } from "./mud/mudStore"
import type { EvmAddress } from "./types"
import { SiweMessage } from "siwe"
import { PUBLIC_CHAIN_ID } from "$env/static/public"

export async function signInWithEthereum(
  address: EvmAddress,
  signMessage: (message: string) => Promise<string>,
) {
  const nonce = await (await fetch("/api/siwe/nonce")).text()

  const message = new SiweMessage({
    address,
    nonce,
    domain: window.location.host,
    statement: "Sign in to Puzzle Bets",
    uri: window.location.origin,
    chainId: Number(PUBLIC_CHAIN_ID),
  })

  const signature = await signMessage(message.prepareMessage())

  const result = await fetch("/api/verify", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ message, signature }),
  })
}

export const user = (() => {
  const { subscribe, set, update } = writable<{
    address: EvmAddress | undefined
    balance: string
  }>({
    address: undefined,
    balance: "0.00",
  })

  let unsub: null | (() => any) = null
  const makeInitialBalanceRequest = async (account: Account) => {
    if (unsub) return
    unsub = mud.subscribe(($mud) => {
      if ($mud.network) {
        unsub?.()
        updateBalance(account.address)
      }
    })
  }

  let balanceInterval: NodeJS.Timeout | null = null
  walletStore.subscribe(async ({ account }) => {
    if (account) {
      update((x) => ({ ...x, address: account.address as EvmAddress }))

      makeInitialBalanceRequest(account)

      if (!balanceInterval) {
        balanceInterval = setInterval(
          () => updateBalance(account.address),
          4000,
        )
      }
    } else {
      balanceInterval && clearInterval(balanceInterval)
      unsub = null
      set({ address: undefined, balance: "0.00" }) // Reset store if no user
    }
  })

  // Function to update balance
  let prevBalance: string
  async function updateBalance(address: string) {
    const $mud = get(mud)
    if (!$mud?.network?.publicClient) return

    const balance = await $mud.network.publicClient.getBalance({ address })
    const formattedBalance = Number(formatEther(balance)).toFixed(4)

    if (formattedBalance === prevBalance) return
    prevBalance = formattedBalance

    update((x) => ({ ...x, balance: formattedBalance }))
  }

  // Publicly expose only the subscribe method to prevent external updates
  return {
    subscribe,
  }
})()
