import { capitalized, formatAsDollar } from "$lib/util";

export async function load({ url }) {
  const gameTypeParam = url?.searchParams.get("gameType");
  const gameType = gameTypeParam ? capitalized(gameTypeParam) : "";

  const senderNameParam = url?.searchParams.get("from");
  const senderName = senderNameParam
    ? senderNameParam.split("_").join(" ")
    : null;

  const usdValue = url?.searchParams.get("valUsd");

  const challengeAmountString = usdValue
    ? formatAsDollar(Number(usdValue)) + " "
    : "";

  let memo = "";
  if (senderName) {
    memo = `${senderName} challenged you to a ${challengeAmountString}${gameType} game`;
  } else {
    memo = `You've been challenged to a ${challengeAmountString}${gameType} game`;
  }

  const title = "Puzzle Bets! You've been challenged";

  return {
    memo,
    title,
  };
}
