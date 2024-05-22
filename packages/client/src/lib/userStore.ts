import { writable, get } from "svelte/store"
import { walletStore } from "./walletStore"
import { formatEther, type Account } from "viem"
import { mud } from "./mud/mudStore"
import type { EvmAddress } from "./types"
import { signInWithEthereum } from "./siwe"

const initialState = {
  address: undefined,
  authenticated: false,
  balance: "0.00",
}

const makeBalanceSync = (set: (balance: string) => any) => {
  let started = false
  let syncInterval: NodeJS.Timer | null = null

  async function updateBalance(address: string) {
    const publicClient = get(mud)?.network?.publicClient
    if (!publicClient) return

    const balance = await publicClient.getBalance({ address })
    const formattedBalance = Number(formatEther(balance)).toFixed(4)
    set(formattedBalance)
  }

  return {
    start: async (address: string, interval = 2000) => {
      if (started) return
      started = true

      // If a public client isn't available, wait until we have a public client to request
      if (!get(mud).network) {
        await new Promise((resolve) => {
          const unsub = mud.subscribe(({ network }) => {
            if (network) {
              unsub()
              resolve(true)
            }
          })
        })
      }

      updateBalance(address)

      syncInterval = setInterval(() => {
        updateBalance(address)
      }, interval)
    },

    stop: () => {
      if (syncInterval) clearInterval(syncInterval)
      if (started) started = false
    },
  }
}

export const user = (() => {
  const userState = writable<{
    address: EvmAddress | undefined
    authenticated: boolean
    balance: string
  }>(initialState)

  const balanceSync = makeBalanceSync((balance: string) => {
    userState.update((s) => ({ ...s, balance }))
  })

  walletStore.subscribe(({ account, signMessage }) => {
    const walletAddress = account?.address as EvmAddress | undefined
    if (!walletAddress) {
      balanceSync.stop()
      userState.set(initialState)
      return initialState
    }

    if (!signMessage) {
      throw new Error("No SIWE signer available")
    }

    const curState = get(userState)

    if (curState.address !== walletAddress) {
      balanceSync.stop()
      balanceSync.start(walletAddress)
      userState.update((s) => ({ ...s, address: walletAddress }))

      signInWithEthereum(
        walletAddress,
        signMessage,
      ).then((authenticated) =>
        userState.update((s) => ({ ...s, authenticated })),
      )
    }
  })

  // Publicly expose only the subscribe method to prevent external updates
  return {
    subscribe: userState.subscribe,
  }
})()
