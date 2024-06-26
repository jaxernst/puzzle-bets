import type { RequestEvent } from "./$types"
import type { PushSubscription } from "web-push"
import { supabase } from "$lib/server/supabaseClient"

export type AlarmSubscriptionBody = PushSubscription

export async function POST({ request, params }: RequestEvent) {
  const { deviceId } = params
  const subscription: AlarmSubscriptionBody = await request.json()
  console.log("deviceId", deviceId, "subscription", subscription)
  if (!subscription) {
    return new Response("No subscription received", { status: 400 })
  }

  // Save subscription to "notifications" table
  try {
    const { data } = await supabase
      .from("notifications")
      .select("subscription")
      .match({ device_id: deviceId })

    // If all subscriptions match the new one, don't update
    if (
      data &&
      data.every((row) => {
        return JSON.stringify(row.subscription) === JSON.stringify(subscription)
      })
    ) {
      console.log("Subscription already up to date")
      return new Response(null, { status: 200 })
    }

    // Update db notifications for all matching deviceID subscriptions
    const { error } = await supabase
      .from("notifications")
      .update({
        subscription: subscription as any,
      })
      .match({ device_id: deviceId })

    console.log("Subscription update for device", deviceId)
    if (error) throw error
  } catch (error) {
    console.error("Failed to save the subscription to the database: ", error)
    return new Response(null, { status: 500 })
  }

  return new Response(null, { status: 201 })
}
