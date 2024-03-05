import { type Entity } from "@latticexyz/recs";
import type { SetupNetworkResult } from "./setupNetwork";
import { gameTypeToNumber, type GameType } from "../types";
import { parseEther } from "viem";
import { systemTimestamp } from "$lib/util";

export type SystemCalls = ReturnType<typeof createSystemCalls>;

/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */
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

  const joinGame = async (gameId: Entity, wagerEth: number) => {
    const tx = await worldContract.write.games__joinGame(
      [gameId as `0x${string}`],
      { value: parseEther(wagerEth.toString()) }
    );
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

  const voteRematch = async (gameId: Entity) => {
    const tx = await worldContract.write.games__voteRematch([
      gameId as `0x${string}`,
    ]);
    await waitForTransaction(tx);
  };

  const cancelPendingGame = async (gameId: Entity) => {
    const tx = await worldContract.write.games__cancelPendingGame([
      gameId as `0x${string}`,
    ]);
    await waitForTransaction(tx);
  };

  return {
    newGame,
    joinGame,
    submitSolution,
    claim,
    voteRematch,
    cancelPendingGame,
  };
}
