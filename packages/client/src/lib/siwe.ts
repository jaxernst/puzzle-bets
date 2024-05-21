import { PUBLIC_CHAIN_ID } from "$env/static/public"
import type { EvmAddress } from "$lib/types"
import { SiweMessage } from "siwe"
import { recoverMessageAddress, type Account } from "viem"
import { twAuth } from "./thirdweb"
import { signLoginPayload } from "thirdweb/auth"

export async function signInWithEthereum(
  address: EvmAddress,
  account: Account
) {
  const payload = await (
    await fetch("/api/auth/generate-payload", {
      credentials: "include",
      method: "POST",
      body: JSON.stringify({ address })
    })
  ).json()

  const signature = await signLoginPayload({
    payload,
    account,
  });

  const result = await fetch("/api/auth/verify", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ signature, payload }),
    credentials: "include",
  })

  return result.ok
}
