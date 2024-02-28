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
  import { user } from "$lib/mud/mudStore";
  import { slide } from "svelte/transition";
  import { intToEntity } from "$lib/util";
  import type { GameType } from "$lib/types";
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

<div class="w-full h-full fixed">
  <main class="h-full flex flex-col max-w-[36rem] mx-auto text-white">
    {#if $user || !$page.url.pathname.includes("welcome")}
      <section in:slide class="px-3 pt-2">
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
            class="text-sm rounded-full px-2 border border-lime-500 text-lime-500 font-semibold disabled:opacity-50 active:bg-neutral-300"
            on:click={() => (showNewGameModal = true)}
            disabled={!$user || !SUPPORTED_GAME_TYPES.includes(gameType)}
            >New
          </button>
          <button
            class="text-sm rounded-full px-2 border border-lime-500 text-lime-500 font-semibold disabled:opacity-50 active:bg-neutral-300"
            on:click={() => (showNewGameModal = true)}
            disabled={true ||
              !$user ||
              !SUPPORTED_GAME_TYPES.includes(gameType)}>Join</button
          >
          <button
            class="text-sm rounded-full px-2 border border-lime-500 text-lime-500 font-semibold disabled:opacity-50 active:bg-neutral-300"
            on:click={() => goto(`/games/${gameType}/demo`)}
            disabled={!SUPPORTED_GAME_TYPES.includes(gameType)}
          >
            Practice
          </button>
        {/if}
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
    {#if $user}
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
