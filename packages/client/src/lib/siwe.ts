import { PUBLIC_CHAIN_ID } from "$env/static/public"
import type { EvmAddress } from "$lib/types"
import { createSiweMessage, verifySiweMessage } from "viem/siwe"
import { publicClient } from "./mud/setupNetwork"

export async function signInWithEthereum(
  address: EvmAddress,
  signMessage: ({ message }: { message: string }) => Promise<string>,
) {
  const nonce = await (await fetch("/api/siwe/nonce")).text()

  const message = createSiweMessage({
    address,
    nonce,
    chainId: Number(PUBLIC_CHAIN_ID),
    domain: "example.com",
    uri: "https://example.com/path",
    version: "1",
  })

  const signature = await signMessage({ message })

  const result = await fetch("/api/siwe/verify", {
    method: "POST",
    body: JSON.stringify({ message, signature }),
  })

  return true
}
