import { twAuth } from "$lib/server/twAuth"
import type { RequestHandler } from "./$types"
import { generateNonce } from "siwe"

export const GET: RequestHandler = async ({ request }) => {
  const { address } = await request.json()

  const loginPayload = await twAuth.generatePayload({ address })

  console.log("Login payload", loginPayload)
  return new Response(JSON.stringify(loginPayload), { status: 200 })
}
