import { SiweMessage } from "siwe"
import type { RequestHandler } from "./$types"
import { publicClient } from "$lib/mud/setupNetwork"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "$env/static/private"

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { message, signature } = await request.json()
  const token = cookies.get("auth")

  if (!token) return new Response("No token provided", { status: 400 })

  const decoded = jwt.verify(token, JWT_SECRET)
  const { nonce } = decoded as { nonce: string }
  console.log("Decoded nonce from auth cookie", nonce)

  if (!message.includes(nonce)) {
    throw new Error("Nonce does not match")
  }

  const valid = await publicClient.verifySiweMessage({
    message,
    signature,
  })

  if (valid) {
    // Optionally clear the cookie or set a new nonce
    const headers = new Headers()
    headers.append(
      "Set-Cookie",
      "auth=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Strict",
    )

    return new Response("ok", { status: 200, headers })
  } else {
    return new Response("invalid signature", { status: 403 })
  }
}
