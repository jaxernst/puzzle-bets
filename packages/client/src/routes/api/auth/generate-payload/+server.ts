import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ request }) => {
  const { address } = await request.json()

  const loginPayload = await twAuth.generatePayload({ address })

  console.log("Login payload", loginPayload)
  return new Response(JSON.stringify(loginPayload), { status: 200 })
}
