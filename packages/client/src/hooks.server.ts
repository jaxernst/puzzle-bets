import { verifyUserToken } from "$lib/server/auth"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("session_token")
  if (token) {
    const verified = verifyUserToken(token)

    if (verified) {
      // Attach user info to the event context if token is valid
      event.locals.user = verified.user
    } else {
      // Clear the session cookie if the token is invalid
      event.cookies.set("session_token", "", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        expires: new Date(0), // Expire the cookie immediately
      })
    }
  }

  const response = await resolve(event)

  // Optionally add headers or perform other response manipulations here
  return response
}
