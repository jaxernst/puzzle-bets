/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
import { deviceHash } from "$lib/notifications/notificationUtil"
import { build, files, version } from "$service-worker"

declare const self: ServiceWorkerGlobalScope

interface PushSubscriptionChangeEvent extends ExtendableEvent {
  readonly newSubscription?: PushSubscription
  readonly oldSubscription?: PushSubscription
}

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`

const ASSETS = [...build, ...files]

/* 

self.addEventListener("install", (event) => {
  console.log("SW install");
  // Create a new cache and add all files to it
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  // Temporarily paused until this can be tested properly
  //  event.waitUntil(addFilesToCache());
});

self.addEventListener("activate", (event) => {
  // Remove previous cached data from disk
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
  }

  // event.waitUntil(deleteOldCaches());
});

self.addEventListener("fetch", (event) => {
  // ignore POST requests etc
  if (event.request.method !== "GET") return;

  async function respond() {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      return cache.match(url.pathname);
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      if (response.status === 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      return cache.match(event.request);
    }
  }

  //event.respondWith(respond() as Promise<Response>);
});

*/

/** Push Notifications  **/

self.addEventListener("push", (event) => {
  console.log("Push event received")

  let data
  try {
    data = event.data?.json()
  } catch {
    data = {}
  }

  const title = data.title || "Puzzle Bets"

  const options = {
    body: data.body,
    icon: "icons/icon-192x192.png",
    badge: data.badge,
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

const handlePushRenew = async () => {
  const newSubscription = await self.registration.pushManager.getSubscription()
  await fetch(`api/notifications/_/${await deviceHash()}/update`, {
    method: "POST",
    body: JSON.stringify(newSubscription),
    headers: {
      "content-type": "application/json",
    },
  })
}

self.addEventListener(
  "pushsubscriptionchange" as any,
  (event: PushSubscriptionChangeEvent) => {
    event.waitUntil(handlePushRenew())
  },
)
