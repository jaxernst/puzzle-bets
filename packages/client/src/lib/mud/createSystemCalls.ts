/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import type { Entity } from "@latticexyz/recs";
import type { SetupNetworkResult } from "./setupNetwork";
import { gameTypeToNumber, type GameType } from "../types";
import { formatEther, parseEther } from "viem";
import { systemTimestamp } from "$lib/util";

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
    const inviteExpirationTimestamp = BigInt(systemTimestamp() + 15 * 60);

    const tx = await worldContract.write.newGame(
      [gameTypeToNumber[gameType], submissionWindow, inviteExpirationTimestamp],
      { value: parseEther(wagerEth.toString()) }
    );

    await waitForTransaction(tx);
  };

  const joinGame = async (gameId: Entity) => {
    const tx = await worldContract.write.joinGame([gameId as `0x${string}`]);
    await waitForTransaction(tx);
  };

  return {
    newGame,
    joinGame,
  };
}
