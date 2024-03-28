import { createBurnerAccount, getBurnerPrivateKey } from "@latticexyz/common";
import { createWalletClient, type Account } from "viem";
import { writable } from "svelte/store";

export const userWallet = (() => {
  const account = writable<Account | undefined>();

  const connect = () => {
    // Call to auth provider to get wallet client (signer)
    // and other user info
  };

  const connectBurner = () => {
    const burnerAccount = createBurnerAccount(getBurnerPrivateKey());

    account.set(burnerAccount);
    return burnerAccount;
  };

  return {
    subscribe: account.subscribe,
    tryConnect: connectBurner,
  };
})();
