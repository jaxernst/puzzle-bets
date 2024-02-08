import { capitalized } from "$lib/util";

export async function load({ url }) {
  const gameType = capitalized(url?.searchParams.get("gameType") ?? "game");

  const senderName =
    url?.searchParams.get("from")?.split("_").join(" ") ?? null;

  const usdValue = url?.searchParams.get("valUsd");

  return {
    gameType,
    senderName,
    usdValue,
  };
}
