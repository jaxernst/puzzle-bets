import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common";
import { writable } from "svelte/store";
import { createThirdwebClient, defineChain } from "thirdweb";
import { createWallet } from "thirdweb/wallets";
import { PUBLIC_THIRDWEB_CLIENT_ID } from "$env/static/public";
import { viemAdapter } from "thirdweb/adapters/viem";
import { networkConfig } from "./networkConfig";
import type { Wallet } from "./setupNetwork";
import { createWalletClient, zeroAddress } from "viem";

const tw = createThirdwebClient({
  clientId: PUBLIC_THIRDWEB_CLIENT_ID,
});

const twWallet = createWallet("io.metamask");

const chain = defineChain(networkConfig.chain);

export const userWallet = (() => {
  const wallet = writable<Wallet | undefined>();

  const connect = async () => {
    const account = await twWallet.connect({
      client: tw,
      chain,
    });

    const walletClient = viemAdapter.walletClient.toViem({
      client: tw,
      account,
      chain,
    }) as Wallet;

    wallet.set(walletClient);

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
    tryConnect: () => {
      if (chain.id === 31337) return connectBurner();
      return connect();
    },
  };
})();
