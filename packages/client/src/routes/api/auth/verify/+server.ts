import { SiweMessage } from "siwe"
import type { RequestHandler } from "./$types"
import { recoverAddress } from "viem"

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { message, signature } = await request.json()

  try {
    const siweMessage = new SiweMessage(message)

    const sessionNonce = cookies.get("session-nonce")
    if (siweMessage.nonce !== cookies.get("session-nonce")) {
      return new Response("Invalid nonce", { status: 422 })
    }

    const res = await siweMessage.verify({
      signature: signature,
      nonce: sessionNonce,
    })

    if (res.success) {
      return new Response(null, { status: 200 })
    }
  } catch (e) {
    console.log("error", e)
    return new Response("Unknown error occurred", { status: 500 })
  }

  return new Response()
}
