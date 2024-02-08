import { capitalized } from "$lib/util";

export async function load({ url }) {
  const gameType = capitalized(url.searchParams.get("gameType") ?? "game");
  const senderName = url.searchParams.get("from");
  let inviteMessage = "";
  if (senderName) {
    inviteMessage = `${senderName} has invited you to a ${gameType} game!`;
  } else {
    inviteMessage = `You have been invited to a ${gameType} game!`;
  }

  return {
    gameType,
    inviteMessage,
  };
}
