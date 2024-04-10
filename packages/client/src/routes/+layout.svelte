<script lang="ts">
  import "./styles.css";
  import { page } from "$app/stores";
  import WalletConnector, {
    loginAndConnect,
  } from "$lib/components/WalletConnector.svelte";
  import GameSelector from "./GameSelector.svelte";
  import AppHeader from "./AppHeader.svelte";
  import Confetti from "$lib/components/Confetti.svelte";
  import { user } from "$lib/mud/mudStore";
  import { slide } from "svelte/transition";
  import { type PuzzleTypepe } from "$lib/types";
  import GameDropdownControls from "./GameDropdownControls.svelte";

  const gameNames = ["Wordle", "Connections", "Crossword", "Sudoku"];
  $: gameRoute = gameNames.find((game) =>
    $page.url.pathname.includes("games/" + game.toLowerCase())
  );

  const homeRoutes = ["/", "/welcome", "/about"];
</script>

<WalletConnector />
<Confetti />

<div class="w-full h-full fixed">
  <main class="h-full flex flex-col max-w-[36rem] mx-auto text-white">
    {#if $user.address || !homeRoutes.includes($page.url.pathname)}
      <section in:slide class="px-3 pt-2">
        <AppHeader />
      </section>
    {/if}

    <div class="p-3 flex-grow flex flex-col gap-4 overflow-y-auto">
      <section class="flex items-center gap-2 gap-y-1 flex-wrap">
        <GameDropdownControls />
      </section>

      {#if $page.url.pathname.includes("games")}
        <div class="flex justify-center">
          <hr class="w-3/4 border-t border-neutral-300" />
        </div>
      {/if}

      <section class="flex flex-col flex-grow">
        <slot />
      </section>
    </div>
    {#if $user.address}
      <section>
        <GameSelector />
      </section>
    {/if}
  </main>
</div>

<style>
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 40rem;
    margin: 0 auto;
    box-sizing: border-box;
  }
</style>
