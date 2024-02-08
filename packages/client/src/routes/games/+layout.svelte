<script lang="ts">
  import { page } from "$app/stores";
  import { GameStatus, type GameType } from "$lib/types";
  import GameHeader from "./GameHeader.svelte";
  import GameHud from "./GameHud.svelte";
  import { userGames } from "$lib/gameStores";
  import { formatTime, systemTimestamp, urlGameIdToEntity } from "$lib/util";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  $: gameType = $page.route.id?.split("/")[2] as GameType;
  $: gameId = urlGameIdToEntity($page.params.gameId);
  $: game = $userGames.find((g) => g.id === gameId);

  onMount(() => {
    if (gameId && !game) {
      goto("/welcome");
    }
  });

  let inviteExpiry: number | undefined;
  onMount(() =>
    setInterval(() => {
      if (!game) return;

      const tDiff = Number(game.inviteExpiration) - systemTimestamp();
      inviteExpiry = tDiff > 0 ? tDiff : 0;
    }, 1000)
  );
</script>

<div class="flex flex-col flex-grow gap-4">
  <GameHeader {gameType} {gameId} />

  {#if gameId}
    <div class="w-full">
      <GameHud {gameId} />
    </div>
  {/if}

  {#key $page.route.id}
    {#if game && game.status === GameStatus.Pending}
      <div
        class="flex flex-col gap-2 sm:gap-4 grow text-center justify-center items-center font-bold sm:px-6 pb-10"
      >
        The puzzle will reveal for both players once the invite is accepted
        <div class="text-gray-300 text-sm italic">
          {#if inviteExpiry && inviteExpiry > 0}
            Invite expires in {formatTime(inviteExpiry)}...
          {:else if inviteExpiry !== undefined}
            Invite Expired
          {/if}
        </div>
      </div>
    {:else}
      <div class="py-2">
        <slot />
      </div>
    {/if}
  {/key}
</div>
