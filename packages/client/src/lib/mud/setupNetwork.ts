import {
  createPublicClient,
  fallback,
  webSocket,
  http,
  type Hex,
  parseEther,
  type ClientConfig,
  type WalletClient,
  type Transport,
  type Account,
  type Chain,
} from "viem";

import { createFaucetService } from "@latticexyz/services/faucet";
import { encodeEntity, syncToRecs } from "@latticexyz/store-sync/recs";
import { getNetworkConfig } from "./getNetworkConfig";
import IWorldAbi from "contracts/out/IWorld.sol/IWorld.abi.json";
import {
  getContract,
  transportObserver,
  type ContractWrite,
} from "@latticexyz/common";
import { createWorld } from "@latticexyz/recs";
import { browser } from "$app/environment";
import { Subject, share } from "rxjs";
import { track } from "@vercel/analytics";

export const world = createWorld();

/*
 * Import our MUD config, which includes strong types for
 * our tables and other config options. We use this to generate
 * things like RECS components and get back strong types for them.
 *
 * See https://mud.dev/templates/typescript/contracts#mudconfigts
 * for the source of this information.
 */
import mudConfig from "contracts/mud.config";

export type SetupNetworkResult = Awaited<ReturnType<typeof setupNetwork>>;
export type Wallet = WalletClient<Transport, Chain, Account>;

export const networkConfig = {
  ...getNetworkConfig(),
  transport: transportObserver(fallback([webSocket(), http()])),
  pollingInterval: 1000,
} as const satisfies ClientConfig;

export async function setupNetwork(userWallet: Wallet) {
  if (!userWallet.account.address) throw "No wallet address";

  const publicClient = createPublicClient(networkConfig);

  /*
   * Create an observable for contract writes that we can
   * pass into MUD dev tools for transaction observability.
   */
  const write$ = new Subject<ContractWrite>();

  /*
   * Create an object for communicating with the deployed World.
   */
  const worldContract = getContract({
    address: networkConfig.worldAddress as Hex,
    abi: IWorldAbi,
    publicClient,
    walletClient: userWallet,
    onWrite: (write) => write$.next(write),
  });

  /*
   * Sync on-chain state into RECS and keeps our client in sync.
   * Uses the MUD indexer if available, otherwise falls back
   * to the viem publicClient to make RPC calls to fetch MUD
   * events from the chain.
   */
  const { components, latestBlock$, storedBlockLogs$, waitForTransaction } =
    await syncToRecs({
      world,
      config: mudConfig,
      address: networkConfig.worldAddress as Hex,
      publicClient,
      startBlock: BigInt(networkConfig.initialBlockNumber),
      indexerUrl: browser ? window.location.origin : undefined,
    });

  if (networkConfig.faucetServiceUrl) {
    const address = userWallet.account.address;
    console.info("[Dev Faucet]: Player address -> ", address);

    const faucet = createFaucetService(networkConfig.faucetServiceUrl);

    const requestDrip = async () => {
      const balance = await publicClient.getBalance({ address });
      console.info(`[Dev Faucet]: Player balance -> ${balance}`);
      const lowBalance = balance < parseEther(".1");
      if (lowBalance) {
        console.info("[Dev Faucet]: Balance is low, dripping funds to player");

        track("drip_funds", { address });
        await faucet.dripDev({ address });
      }
    };

    requestDrip();
    // Request a drip every 20 seconds
    setInterval(requestDrip, 20000);
  }

  return {
    world,
    components,
    playerEntity: encodeEntity(
      { address: "address" },
      { address: userWallet.account.address }
    ),
    publicClient,
    latestBlock$,
    storedBlockLogs$,
    waitForTransaction,
    worldContract,
    write$: write$.asObservable().pipe(share()),
  };
}
