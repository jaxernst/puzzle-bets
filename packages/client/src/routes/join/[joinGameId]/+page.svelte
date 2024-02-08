<script>
  import { formatAsDollar } from "$lib/util";

  export let data;

  let { gameType, senderName, usdValue } = data;
  senderName = senderName?.split("_").join(" ") ?? null;

  let inviteMessage =
    "Accept the challenge and solve the puzzle to win the pot";

  let title = "Puzzle Bets! ";
  if (senderName) {
    title += `${senderName} challenged you to a ${
      usdValue ? formatAsDollar(Number(usdValue)) : ""
    } ${gameType ?? ""} game`;
  } else {
    title += `${gameType} Game Invite`;
  }
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={inviteMessage} />
</svelte:head>
