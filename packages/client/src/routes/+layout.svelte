<script>
  import { userGames } from "$lib/gameStores";
  import { page } from "$app/stores";
  import WalletConnector, {
    loginAndConnect,
  } from "$lib/components/WalletConnector.svelte";
  import ActiveGames from "./ActiveGames.svelte";
  import ConnectUser from "./UserHeader.svelte";
  import "./styles.css";
  import { onMount } from "svelte";
  import { userWallet } from "$lib/mud/connectWallet";
  import { goto } from "$app/navigation";
  import { walletActions } from "viem";
  import { mud } from "$lib/mud/mudStore";

  onMount(() => {
    goto("/welcome");
  });
</script>

<WalletConnector />

<div class="app max-w-[40rem] mx-auto">
  <main class="text-white flex-grow flex flex-col p-4 gap-5">
    <ConnectUser />
    <section class="flex flex-col gap-2">
      <div class="relative flex gap-2 items-center overflow-auto no-scrollbar">
        {#each ["Wordle", "Tradle", "Crossword", "Jigsaw"] as game}
          <a
            class={`px-3 py-2 self-start rounded-lg text-white font-semibold text-center transition-all whitespace-nowrap
              ${
                $page.route.id?.includes(game.toLocaleLowerCase())
                  ? "bg-lime-500 shadow-lg"
                  : "bg-red-500"
              }
            `}
            href="/games/{game.toLowerCase()}/demo"
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
      <ActiveGames />
    </section>

    <section
      class="flex flex-col flex-grow bg-gray-600 p-4 rounded-2xl shadow-inner"
    >
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
