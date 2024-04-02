import mudConfig from "contracts/mud.config";
import { writable, derived, get } from "svelte/store";
import { mount as mountDevTools } from "@latticexyz/dev-tools";
import {
  type Component,
  type Entity,
  getComponentValue,
} from "@latticexyz/recs";

import {
  setupNetwork,
  type SetupNetworkResult,
  type Wallet,
} from "./setupNetwork";
import { createSystemCalls } from "./createSystemCalls";
import { userWallet } from "$lib/mud/connectWallet";
import { PUBLIC_CHAIN_ID } from "$env/static/public";
import type { Account, WalletClient } from "viem";

export const mud = (() => {
  const mud = writable<SetupNetworkResult>();
  const systemCalls = derived(mud, ($mud) => {
    return $mud && createSystemCalls($mud);
  });

  const stateSynced = writable(false);

  const setup = async (wallet: Wallet) => {
    const network = await setupNetwork(wallet);
    mud.set(network);

    /**
     * Subscribe to component updates and propgate those changes to the mud store
     */
    Object.entries(network.components).forEach(([componentName, component]) => {
      return (component as Component).update$.subscribe((update) => {
        mud.update((mud) => ({
          ...mud,
          components: {
            ...mud.components,
            [componentName]: update.component as any,
          } as any,
        }));
      });
    });

    if (Number(PUBLIC_CHAIN_ID) === 31337) {
      mountDevTools({
        config: mudConfig,
        walletClient: network.walletClient,
        publicClient: network.publicClient,
        latestBlock$: network.latestBlock$,
        storedBlockLogs$: network.storedBlockLogs$,
        worldAddress: network.worldContract.address,
        worldAbi: network.worldContract.abi,
        write$: network.write$,
        recsWorld: network.world,
      });
    }

    /**
     * Wait for state to be synced before resolving setup promise
     */
    return await new Promise((resolve) => {
      stateSynced.subscribe((synced) => {
        if (synced) {
          setTimeout(() => resolve(true), 50);
        }
      });
    });
  };

  /**
   * Subscribe to the SyncProgress component to identify when all state is synced
   */
  mud.subscribe((_mud) => {
    if (!_mud?.components?.SyncProgress) return;
    stateSynced.set(
      getComponentValue(_mud.components.SyncProgress, "0x" as Entity)?.step ===
        "live"
    );
  });

  let setupLoading = false;

  return {
    ...derived(
      [mud, systemCalls, stateSynced],
      ([$network, $systemCalls, $stateSynced]) => {
        return {
          network: $network,
          components: $network?.components,
          systemCalls: $systemCalls,
          stateSynced: $stateSynced,
          ready:
            $stateSynced && $network.components && $systemCalls && $network,
        };
      }
    ),
    setup: async (account: Wallet) => {
      if (setupLoading || get(stateSynced)) return;
      setupLoading = true;
      try {
        await setup(account);
      } finally {
        setupLoading = false;
      }
    },
  };
})();

export const user = derived(userWallet, ($userWallet) => {
  return $userWallet?.account.address;
});
