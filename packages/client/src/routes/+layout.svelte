<script>
  import { page } from "$app/stores";
  import Header from "./Header.svelte";
  import EthSymbol from "$lib/icons/EthSymbol.svelte";
  import "./styles.css";

  $: console.log($page.route.id, $page.route.id?.includes("wordle"));
</script>

<div class="app max-w-[40rem] mx-auto">
  <Header />

  <main class="text-white flex-grow flex flex-col p-4 gap-5">
    <section
      class="flex flex-col gap-2 bg-gray-600 p-4 rounded-2xl shadow-inner"
    >
      <div class="font-mono">Puzzles</div>
      <div class="flex gap-2 items-center">
        {#each ["Wordle", "Tradle", "Crossword", "Jigsaw"] as game}
          <a
            class={`px-3 py-2 self-start rounded-lg text-white font-semibold text-center transition-all
              ${
                $page.route.id?.includes(game.toLocaleLowerCase())
                  ? "bg-lime-500 shadow-lg"
                  : "bg-red-500"
              }
            `}
            href="/games/{game.toLowerCase()}"
          >
            {game}
            <span class="text-xl"> + </span>
          </a>
        {/each}
      </div>
    </section>
    <section
      class="flex flex-col gap-2 bg-gray-600 rounded-2xl p-4 shadow-inner"
    >
      <div class="font-mono">Active Games</div>
      <div class="flex gap-2 items-center">
        {#each ["jaxer.eth"] as name}
          <div
            class="flex gap-2 px-3 py-2 self-start rounded-lg text-white bg-lime-500 font-semibold text-center transition-all"
          >
            {name}
            <span class="font-bold"> $1.21</span>
          </div>
        {/each}
      </div>
    </section>

    <section class="flex-grow bg-gray-600 p-4 rounded-2xl shadow-inner">
      <slot />
    </section>
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
