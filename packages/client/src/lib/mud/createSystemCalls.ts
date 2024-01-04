/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import type { Entity } from "@latticexyz/recs";
import type { SetupNetworkResult } from "./setupNetwork";
import type { GameType } from "../types";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({
  worldContract,
  waitForTransaction,
}: SetupNetworkResult) {
  const newGame = async (
    gameType: GameType,
    submissionWindow: number = 60 * 15
  ) => {
    const tx = await worldContract.write.newGame([gameType, submissionWindow]);
    await waitForTransaction(tx);
  };
  return {};
}
