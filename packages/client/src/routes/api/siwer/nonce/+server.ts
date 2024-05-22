import { twAuth } from "$lib/thirdweb"
import type { RequestHandler } from "../../siwer/nonce/$types"

export const POST: RequestHandler = async ({ request }) => {
  const { address } = await request.json()
  const loginPayload = await twAuth.generatePayload({ address })
  return new Response(JSON.stringify(loginPayload), { status: 200 })
}
