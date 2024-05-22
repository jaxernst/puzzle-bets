import { generateSiweNonce } from "viem/siwe"
import type { RequestHandler } from "./$types"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "$env/static/private"

export const GET: RequestHandler = (req) => {
  const nonce = generateSiweNonce()
  const token = jwt.sign({ nonce }, JWT_SECRET, { expiresIn: "15m" })
  console.log("TOken", token)

  const headers = new Headers()
  headers.append(
    "Set-Cookie",
    `auth=${token}; HttpOnly; Path=/; Secure; SameSite=Strict`,
  )

  console.log("Generate nonce", nonce)
  return new Response(nonce, { status: 200, headers })
}
