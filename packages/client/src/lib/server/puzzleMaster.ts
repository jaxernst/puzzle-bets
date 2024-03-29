import { privateKeyToAccount } from "viem/accounts";
import { PUZZLE_MASTER_PRIVATE_KEY } from "$env/static/private";
import type { EvmAddress } from "$lib/types";

export const puzzleMasterSigner = privateKeyToAccount(
  PUZZLE_MASTER_PRIVATE_KEY as `0x${string}`
);

export function signPlayerSolvedMessage(
  gameId: number,
  player: EvmAddress,
  solutionIndex: number = 1 // Nonce that allows multiple solutions for a single game
) {
  return puzzleMasterSigner.signMessage(
    `${player} solved game ${gameId} with solution index ${solutionIndex}`
  );
}
