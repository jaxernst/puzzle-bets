/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { runQuery, type Entity } from "@latticexyz/recs";
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
    submissionWindowMinutes: number,
    inviteExpirationMinutes: number
  ) => {
    const inviteExpirationTimestamp = BigInt(
      systemTimestamp() + inviteExpirationMinutes * 60
    );

    const tx = await worldContract.write.games__newGame(
      [
        gameTypeToNumber[gameType],
        submissionWindowMinutes * 60,
        inviteExpirationTimestamp,
      ],
      { value: parseEther(wagerEth.toString()) }
    );

    await waitForTransaction(tx);
  };

  const joinGame = async (gameId: Entity) => {
    const tx = await worldContract.write.games__joinGame([
      gameId as `0x${string}`,
    ]);
    await waitForTransaction(tx);
  };

  const submitSolution = async (gameId: Entity, solutionSignature: string) => {
    const tx = await worldContract.write.games__submitSolution([
      gameId as `0x${string}`,
    ]);
    await waitForTransaction(tx);
  };

  const claim = async (gameId: Entity) => {
    const tx = await worldContract.write.games__claim([
      gameId as `0x${string}`,
    ]);
    await waitForTransaction(tx);
  };

  return {
    newGame,
    joinGame,
    submitSolution,
    claim,
  };
}
