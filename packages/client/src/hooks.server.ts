import { verifyUserToken } from "$lib/server/auth"
import type { Handle } from "@sveltejs/kit"

const authPaths = ["api/drip", "api/game-settings", "api/notifications"]

function isAuthPath(urlPathname: string) {
  return authPaths.some((pathSegment) => urlPathname.includes(pathSegment))
}

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

  console.log(event.url.pathname, isAuthPath(event.url.pathname))
  if (event.url.pathname && !event.locals.user) {
  }

  const response = await resolve(event)

  return response
}
