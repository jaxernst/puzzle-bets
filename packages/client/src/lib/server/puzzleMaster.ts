import { privateKeyToAccount } from "viem/accounts";
import { PUZZLE_MASTER_PRIVATE_KEY } from "$env/static/private";

export const puzzleMasterSigner = privateKeyToAccount(
  PUZZLE_MASTER_PRIVATE_KEY as `0x${string}`
);
