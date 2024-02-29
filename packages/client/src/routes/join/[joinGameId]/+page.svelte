<script>
  export let data;

  let { inviteMessage, title } = data;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={inviteMessage} />
</svelte:head>
