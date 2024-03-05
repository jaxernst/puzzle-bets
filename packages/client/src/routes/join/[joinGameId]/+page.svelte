<script>
  export let data;

  let { memo, title } = data;
</script>

<svelte:head>
  <title>{title}</title>
  <meta property="og:title" content={title} />
  <meta name="description" content={memo} />
  <meta property="og:description" content={memo} />
</svelte:head>
