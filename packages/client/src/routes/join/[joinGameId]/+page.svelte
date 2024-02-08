<script>
  export let data;
  $: console.log(data);
</script>

<svelte:head>
  <title>Puzzle Bets | {data.gameType} Invite</title>
  <meta name="description" content={data.inviteMessage} />
</svelte:head>
