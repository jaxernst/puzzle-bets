import { SiweMessage } from "siwe"
import type { RequestHandler } from "./$types"
import { twAuth } from "$lib/thirdweb"

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { payload, signature } = await request.json()

  try {
    const verifiedPayload = await twAuth.verifyPayload({
      payload,
      signature,
    });

    console.log(verifiedPayload)
     
    if (verifiedPayload.valid) {
      return new Response(null, { status: 200 })
    } else {
      return new Response(null, { status: 403})
    }

  } catch (e) {
    console.log("error", e)
    return new Response("Unknown error occurred", { status: 500 })
  }

  return new Response()
}
