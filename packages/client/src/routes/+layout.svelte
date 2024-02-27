<script lang="ts">
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
  import Modal from "$lib/components/Modal.svelte";
  import NewGameModal from "./games/NewGame.svelte";
  import GameResults from "./games/GameResults.svelte";
  import { user } from "$lib/mud/mudStore";
  import { slide } from "svelte/transition";
  import { intToEntity } from "$lib/util";
  import { type GameType } from "$lib/types";
  import { SUPPORTED_GAME_TYPES } from "$lib/constants";

  const gameNames = ["Wordle", "Tradle", "Crossword", "Sudoku"];
  $: gameRoute = gameNames.find((game) =>
    $page.url.pathname.includes("games/" + game.toLowerCase())
  );

  $: dropdownSelection = gameRoute ?? null;
  $: gameType = (dropdownSelection?.toLowerCase() ?? "wordle") as GameType;
  $: gameId = intToEntity($page.params.gameId);

  let showResultsModal = false;
  let showNewGameModal = false;
</script>

<WalletConnector />
<Confetti />

<Modal
  show={showNewGameModal}
  on:close={() => {
    showNewGameModal = false;
  }}
>
  <NewGameModal {gameType} />
</Modal>

<main class="h-[100dvh] flex flex-col max-w-[36rem] mx-auto text-white">
  {#if $user || !$page.url.pathname.includes("welcome")}
    <section in:slide class="px-3 pt-3">
      <AppHeader />
    </section>
  {/if}

  <div class="p-3 flex-grow flex flex-col gap-4 overflow-y-auto">
    <section class="flex items-center gap-2 gap-y-1 flex-wrap">
      <Dropdown
        bind:selection={dropdownSelection}
        options={gameNames}
        placeholder="Select a game"
        onOptionSelect={(option) => {
          goto(`/games/${option.toLowerCase()}/demo`);
        }}
      />
      {#if $page.url.pathname !== "/welcome"}
        <button
          class="bg-lime-500 rounded-full font-semibold text-sm px-2 py-[.1rem] whitespace-nowrap disabled:opacity-60"
          on:click={() => (showNewGameModal = true)}
          disabled={!$user || !SUPPORTED_GAME_TYPES.includes(gameType)}
          >New
        </button>
        <button
          class="bg-lime-500 rounded-full font-semibold text-sm px-2 py-[.1rem] whitespace-nowrap disabled:opacity-60"
          on:click={() => (showNewGameModal = true)}
          disabled={!$user || !SUPPORTED_GAME_TYPES.includes(gameType)}
          >Join</button
        >
        <button
          class="bg-lime-500 rounded-full font-semibold text-sm px-2 py-[.1rem] whitespace-nowrap"
          disabled={!SUPPORTED_GAME_TYPES.includes(gameType)}>Practice</button
        >
      {/if}
    </section>

    {#if $page.url.pathname.includes("games")}
      <div class="flex justify-center">
        <hr class="w-3/4 border-t border-gray-300" />
      </div>
    {/if}

    <section class="flex flex-col flex-grow">
      <slot />
      <div class="sm:hidden h-10"></div>
    </section>
  </div>
  {#if $user}
    <section>
      <GameSelector />
    </section>
  {/if}
</main>

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
