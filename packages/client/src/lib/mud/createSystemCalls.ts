/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import type { Entity } from "@latticexyz/recs";
import type { SetupNetworkResult } from "./setupNetwork";
import { gameTypeToNumber, type GameType } from "../types";
import { formatEther, parseEther } from "viem";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls({
  worldContract,
  waitForTransaction,
}: SetupNetworkResult) {
  const newGame = async (
    gameType: GameType,
    wagerEth: number,
    submissionWindow: number,
    inviteExpiration: number
  ) => {
    const tx = await worldContract.write.newGame(
      [gameTypeToNumber[gameType], submissionWindow],
      { value: parseEther(wagerEth.toString()) }
    );

    await waitForTransaction(tx);
  };
  return {
    newGame,
  };
}
