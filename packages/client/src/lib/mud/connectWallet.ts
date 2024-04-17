import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common"
import { derived, writable } from "svelte/store"
import { createThirdwebClient, defineChain, getRpcClient } from "thirdweb"
import { PUBLIC_CHAIN_ID, PUBLIC_THIRDWEB_CLIENT_ID } from "$env/static/public"
import { createWallet, type Account as TwAccount } from "thirdweb/wallets"
import { viemAdapter } from "thirdweb/adapters/viem"
import { createWalletClient, type Chain } from "viem"
import { networkConfig } from "./networkConfig"
import { type Wallet } from "./setupNetwork"

export const tw = createThirdwebClient({
  clientId: PUBLIC_THIRDWEB_CLIENT_ID,
})

export const twWallet = createWallet("embedded")

export const chain = networkConfig.chain

export const walletStore = (() => {
  const wallet = writable<Wallet | undefined>()
  const connecting = writable(false)

  const connect = async (authMethod: "auto" | "google" | "apple" | "email") => {
    let account: TwAccount
    if (authMethod === "auto") {
      account = await twWallet.autoConnect({ client: tw })
    } else {
      account = await twWallet.connect({
        client: tw,
        strategy: authMethod,
      })
    }

    const walletClient = viemAdapter.walletClient.toViem({
      client: tw,
      account: account,
      chain: defineChain(chain as any),
    }) as Wallet

    wallet.set(walletClient)
    return walletClient
  }

  const connectBurner = () => {
    const burnerAccount = createBurnerAccount(getBurnerPrivateKey())
    const walletClient = createWalletClient({
      ...networkConfig,
      account: burnerAccount,
    }) as Wallet

    wallet.set(walletClient)
    return walletClient
  }

  const { subscribe } = derived(
    [wallet, connecting],
    ([$wallet, $connecting]) => ({
      ...$wallet,
      connecting: $connecting,
    }),
  )

  return {
    subscribe,
    tryConnect: async (
      method: "auto" | "google" | "apple" | "email",
    ): Promise<Wallet> => {
      if (chain.id === 31337 || chain.id === 4242) return connectBurner()

      connecting.set(true)
      try {
        return await connect(method)
      } finally {
        connecting.set(false)
      }
    },
    disconnect: () => {
      twWallet.disconnect()
      wallet.set(undefined)
    },
  }
})()
