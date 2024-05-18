import { PUBLIC_CHAIN_ID } from "$env/static/public"
import type { EvmAddress } from "$lib/types"
import { SiweMessage } from "siwe"

export async function signInWithEthereum(
  address: EvmAddress,
  signMessage: (message: string) => Promise<string>,
) {
  const nonce = await (await fetch("/api/siwe/nonce")).text()

  const message = new SiweMessage({
    address,
    nonce,
    domain: window.location.host,
    statement: "Sign in to Puzzle Bets",
    uri: window.location.origin,
    chainId: Number(PUBLIC_CHAIN_ID),
  })

  const signature = await signMessage(message.prepareMessage())

  const result = await fetch("/api/verify", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ message, signature }),
  })

  return true
}
