<script lang="ts">
  import { page } from "$app/stores";
  import Dropdown from "$lib/components/Dropdown.svelte";
  import { goto } from "$app/navigation";
  import { user } from "$lib/mud/mudStore";
  import { intToEntity } from "$lib/util";
  import { type GameType } from "$lib/types";
  import { SUPPORTED_GAME_TYPES } from "$lib/constants";
  import { clickOutside } from "$lib/actions/clickOutside";
  import Modal from "$lib/components/Modal.svelte";
  import NewGame from "./games/NewGame.svelte";

  const gameNames = ["Wordle", "Connections", "Crossword", "Sudoku"];
  $: gameRoute = gameNames.find((game) =>
    $page.url.pathname.includes("games/" + game.toLowerCase())
  );

  $: dropdownSelection = gameRoute ?? null;
  $: gameType = (dropdownSelection?.toLowerCase() ?? "wordle") as GameType;

  const homeRoutes = ["/", "/welcome", "/about"];

  let showNewGameModal = false;
  let showJoinGameInput = false;
  let inputGameId = "";
</script>

<Modal
  show={showNewGameModal}
  on:close={() => {
    showNewGameModal = false;
  }}
>
  <NewGame {gameType} />
</Modal>

<Dropdown
  bind:selection={dropdownSelection}
  options={gameNames}
  placeholder="Select a game"
  onOptionSelect={(option) => {
    goto(`/games/${option.toLowerCase()}/demo`);
  }}
/>
{#if !homeRoutes.includes($page.url.pathname)}
  <button
    class="text-sm rounded-full px-2 border border-lime-500 text-lime-500 font-semibold disabled:opacity-50 active:bg-neutral-300"
    on:click={() => (showNewGameModal = true)}
    disabled={!$user || !SUPPORTED_GAME_TYPES.includes(gameType)}
    >New
  </button>

  {#if showJoinGameInput}
    <form
      class="flex flex-col gap-2"
      on:submit|preventDefault={() => {
        showJoinGameInput = false;
        if (inputGameId) {
          goto(`/join/${inputGameId}`);
        }
      }}
    >
      <input
        type="text"
        class="text-sm w-[90px] rounded-full px-2 border border-lime-500 bg-neutral-100 text-neutral-900 font-semibold"
        placeholder="Game ID"
        bind:value={inputGameId}
        use:clickOutside={{
          enabled: showJoinGameInput,
          cb: () => {
            showJoinGameInput = false;
          },
        }}
      />
    </form>
  {/if}
  <button
    class="text-sm rounded-full px-2 border border-lime-500 text-lime-500 font-semibold disabled:opacity-50 active:bg-neutral-300"
    on:click|stopPropagation={() => {
      if (showJoinGameInput && inputGameId) {
        showJoinGameInput = false;
        goto(`/join/${inputGameId}`);
      } else {
        showJoinGameInput = true;
      }
    }}
    disabled={!$user || !SUPPORTED_GAME_TYPES.includes(gameType)}>Join</button
  >
  <button
    class="text-sm rounded-full px-2 border border-lime-500 text-lime-500 font-semibold disabled:opacity-50 active:bg-neutral-300"
    on:click={() => goto(`/games/${gameType}/demo`)}
    disabled={!SUPPORTED_GAME_TYPES.includes(gameType)}
  >
    Practice
  </button>
{/if}
