import { capitalized } from "$lib/util";

export async function load({ url }) {
  const gameType = capitalized(url?.searchParams.get("gameType") ?? "game");
  const senderName = url?.searchParams.get("from");

  return {
    gameType,
    senderName,
  };
}
