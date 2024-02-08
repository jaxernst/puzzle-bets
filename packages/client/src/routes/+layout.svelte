<script>
  import "./styles.css";
  import { page } from "$app/stores";
  import WalletConnector from "$lib/components/WalletConnector.svelte";
  import GameSelector from "./GameSelector.svelte";
  import AppHeader from "./AppHeader.svelte";
  import Confetti from "$lib/components/Confetti.svelte";
</script>

<WalletConnector />
<Confetti />

<div class="app max-w-[40rem] mx-auto">
  <main class="text-white flex-grow flex flex-col p-4 gap-4 sm:gap-5">
    <AppHeader />
    <section class="flex flex-col gap-2">
      <div class="relative flex gap-2 items-center overflow-auto no-scrollbar">
        {#each ["Wordle", "Tradle", "Crossword", "Sudoku"] as game}
          <a
            class={`px-3 py-2 self-start rounded-lg text-white font-semibold text-center transition-all whitespace-nowrap
              ${
                $page.route.id?.includes(game.toLocaleLowerCase())
                  ? "bg-lime-500 shadow-lg"
                  : "bg-pb-yellow"
              }
            `}
            href="/games/{game.toLowerCase()}/demo"
          >
            {game}
            <span class="text-xl"></span>
          </a>
        {/each}
      </div>
    </section>
    <section
      class="flex flex-col gap-2 bg-gray-600 rounded-2xl p-4 shadow-inner"
    >
      <GameSelector />
    </section>

    <section
      class="flex flex-col flex-grow bg-gray-600 p-4 rounded-2xl shadow-inner"
    >
      <slot />
    </section>
    <div class="sm:hidden h-5"></div>
  </main>
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
