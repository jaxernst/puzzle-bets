import type { RequestHandler } from "./$types"
import { generateNonce } from "siwe"

export const GET: RequestHandler = (req) => {
  const nonce = generateNonce()

  req.cookies.set("session-nonce", nonce, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 300, // Cookie expiration in seconds
    secure: process.env.NODE_ENV === "production",
  })

  return new Response(nonce, { status: 200 })
}
