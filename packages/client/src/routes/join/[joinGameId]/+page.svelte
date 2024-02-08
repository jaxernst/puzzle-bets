<script>
  export let data;

  let { gameType, senderName } = data;
  senderName = senderName?.split("_").join(" ") ?? null;

  let inviteMessage = "";
  if (senderName) {
    inviteMessage = `${senderName} has invited you to a ${gameType} game!`;
  } else {
    inviteMessage = `You have been invited to a ${gameType} game!`;
  }
</script>

<svelte:head>
  <title
    >Puzzle Bets | {data.gameType} Invite {senderName
      ? `from ${senderName}`
      : ""}</title
  >
  <meta name="description" content={inviteMessage} />
</svelte:head>
