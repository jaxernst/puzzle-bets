import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common";
import { writable } from "svelte/store";
import { createThirdwebClient, defineChain, getRpcClient } from "thirdweb";
import { PUBLIC_CHAIN_ID, PUBLIC_THIRDWEB_CLIENT_ID } from "$env/static/public";
import { createWallet } from "thirdweb/wallets";
import { viemAdapter } from "thirdweb/adapters/viem";
import { createWalletClient, type Chain } from "viem";
import { networkConfig } from "./networkConfig";
import type { Wallet } from "./setupNetwork";
import { browser } from "$app/environment";

export const tw = createThirdwebClient({
  clientId: PUBLIC_THIRDWEB_CLIENT_ID,
});

export const twWallet = createWallet("embedded");

if (browser) {
  twWallet.autoConnect({
    client: tw,
  });
}

export const chain = networkConfig.chain;

export const userWallet = (() => {
  const wallet = writable<Wallet | undefined>();

  const connect = async (authMethod: "google" | "apple" | "email") => {
    const _account = await twWallet.connect({
      client: tw,
      strategy: authMethod,
    });

    const walletClient = viemAdapter.walletClient.toViem({
      client: tw,
      account: _account,
      chain: defineChain(chain as any),
    });

    wallet.set(walletClient as Wallet);
    return walletClient;
  };

  const connectBurner = () => {
    const burnerAccount = createBurnerAccount(getBurnerPrivateKey());
    const walletClient = createWalletClient({
      ...networkConfig,
      account: burnerAccount,
    });

    wallet.set(walletClient);
    return burnerAccount;
  };

  return {
    subscribe: wallet.subscribe,
    tryConnect: (authMethod: "google" | "apple" | "email") => {
      if (chain.id === 31337) return connectBurner();
      return connect(authMethod);
    },
  };
})();
