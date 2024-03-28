import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common";
import { createWalletClient } from "viem";
import { networkConfig, type Wallet } from "./setupNetwork";
import { transactionQueue, writeObserver } from "@latticexyz/common/actions";
import { writable } from "svelte/store";

export const userWallet = (() => {
  const wallet = writable<Wallet | undefined>();

  const connect = () => {
    // Call to auth provider to get wallet client (signer)
    // and other user info
  };

  const connectBurner = () => {
    const burnerAccount = createBurnerAccount(getBurnerPrivateKey());
    const client = createWalletClient({
      ...networkConfig,
      account: burnerAccount,
    }).extend(transactionQueue());

    wallet.set(client);
    return client;
  };

  return {
    ...wallet,
    tryConnect: connectBurner,
  };
})();
