import { type MUDChain, mudFoundry } from "@latticexyz/common/chains";

// Override default lattice chain with 'miner.testnet' (from follower.testnet)
const latticeTestnet = {
  name: "Lattice Testnet",
  id: 4242,
  network: "lattice-testnet",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: {
      http: ["https://miner.testnet-chain.linfra.xyz"],
      webSocket: ["wss://miner.testnet-chain.linfra.xyz"],
    },
    public: {
      http: ["https://miner.testnet-chain.linfra.xyz"],
      webSocket: ["wss://miner.testnet-chain.linfra.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Otterscan",
      url: "https://explorer.testnet-chain.linfra.xyz",
    },
  },
  faucetUrl: "https://faucet.testnet-mud-services.linfra.xyz",
} as const satisfies MUDChain;

/*
 * See https://mud.dev/tutorials/minimal/deploy#run-the-user-interface
 * for instructions on how to add networks.
 */
export const supportedChains: MUDChain[] = [mudFoundry, latticeTestnet];
