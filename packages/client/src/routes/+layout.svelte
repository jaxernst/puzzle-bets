<script>
  import "./styles.css";
  import { page } from "$app/stores";
  import WalletConnector, {
    loginAndConnect,
  } from "$lib/components/WalletConnector.svelte";
  import GameSelector from "./GameSelector.svelte";
  import AppHeader from "./AppHeader.svelte";
  import Confetti from "$lib/components/Confetti.svelte";
  import Dropdown from "$lib/components/Dropdown.svelte";
  import { goto } from "$app/navigation";
  import Plus from "$lib/icons/Plus.svelte";
  import { user } from "$lib/mud/mudStore";
  import { slide } from "svelte/transition";

  const gameNames = ["Wordle", "Tradle", "Crossword", "Sudoku"];
  $: gameRoute = gameNames.find((game) =>
    $page.url.pathname.includes("games/" + game.toLowerCase())
  );
</script>

<WalletConnector />
<Confetti />

<div class="app max-w-[36rem] mx-auto text-white">
  <main class=" flex-grow flex flex-col p-4 gap-4 sm:gap-5">
    {#if $user || !$page.url.pathname.includes("welcome")}
      <section in:slide>
        <AppHeader />
      </section>
    {/if}

    <section class="flex items-center gap-2 gap-y-1 flex-wrap">
      <Dropdown
        options={gameNames}
        placeholder="Select a game"
        selectionOverride={gameRoute}
        onOptionSelect={(option) => {
          goto(`/games/${option.toLowerCase()}/demo`);
        }}
      />
      {#if $page.url.pathname !== "/welcome"}
        <button
          class="bg-lime-500 rounded-full font-semibold text-sm sm:text-sm px-2 py-[.1rem] whitespace-nowrap disabled:opacity-60"
          disabled={!$user}
          >New
        </button>
        <button
          class="bg-lime-500 rounded-full font-semibold text-sm sm:text-sm px-2 py-[.1rem] whitespace-nowrap disabled:opacity-60"
          disabled={!$user}>Join</button
        >
        <button
          class="bg-lime-500 rounded-full font-semibold text-sm sm:text-sm px-2 py-[.1rem] whitespace-nowrap"
          >Practice</button
        >
      {/if}
    </section>

    {#if false}
      <section class="flex flex-col gap-2 text-off-black">
        <GameSelector />
      </section>
    {/if}

    <section class="flex flex-col flex-grow">
      <slot />
    </section>
  </main>
  <div class="sm:hidden h-5"></div>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 40rem;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
