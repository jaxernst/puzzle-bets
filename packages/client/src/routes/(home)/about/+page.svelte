<script>
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte";
  import { fade, slide } from "svelte/transition";
  import { page } from "$app/stores";
  import { cubicOut } from "svelte/easing";
  import Warpcast from "$lib/icons/Warpcast.svelte";
  import Github from "$lib/icons/Github.svelte";

  $: path = $page.url.pathname;
  const slideDuration = 450;
</script>

<svelte:head>
  <title>Puzzle Bets | About</title>
  <meta property="og:title" content="Puzzle Bets | About" />
</svelte:head>

<div class="relative col-start-1 row-start-1">
  <div
    class="absolute bottom-0 left-0 w-full h-full col-start-1"
    transition:slide={{ duration: slideDuration, easing: cubicOut }}
  >
    <a
      href="/welcome"
      class="w-full text-center font-semibold text-neutral-500 flex justify-center items-center"
      in:fade={{ delay: slideDuration / 8 }}
    >
      Return home
      <AnimatedArrow
        direction={path === "/about" ? "up" : "down"}
        klass="h-5 w-5 fill-neutral-600 stroke-neutral-400"
      />
    </a>

    <h1 class="text-neutral-800 font-semibold my-4 text-2xl">The Game</h1>

    <p class="py-1 text-neutral-600 font-medium">
      Puzzle bets is a player vs player onchain competitive puzzle game. Players
      can challenge each other to puzzles, and place wagers on the results.
    </p>

    <h2 class="mt-4 text-xl text-lime-500 font-bold">How to Play</h2>
    <p class="py-1 text-neutral-600 font-medium">
      Players challenge each other by creating games and sharing invite links.
      To initiate a game, a player deposits their wager into a smart contract,
      the game gets created, and an invite link is generated. After sharing this
      invite link, the second player can join and start the game. Once started,
      an identical puzzle is revealed for both players and the clock starts
      ticking.
    </p>

    <h2 class="mt-4 text-xl text-lime-500 font-bold">Winning the pot</h2>

    <p class="py-1 text-neutral-600 font-medium">
      Different puzzles will have different criteria to determine a victor.
      Currently, only <span class="font-bold">Wordle</span> is supported. In order
      to win the Wordle pot, you must be the sole player to solve the Wordle in the
      allotted time. In the event of a tie, the game may be restarted until a victor
      emerges.
    </p>

    <h1 class="text-neutral-800 font-semibold mb-4 mt-6 text-2xl">
      The Project
    </h1>

    <p class="py-1 text-neutral-600 font-medium">
      Puzzle bets is being developed in the open! All code, including the smart
      contracts, backend, and frontend are open source and available on Github
    </p>

    <p class="py-1 text-neutral-600 font-medium">
      This is an early, unofficial testnet release of Puzzle Bets. Any feedback
      or bugs reports are welcome on github, Farcaster, or Twitter.
    </p>

    <h2 class="mt-4 text-xl text-lime-500 font-bold">Follow For Updates</h2>

    <div class="px-2 py-4 flex flex-col gap-4">
      <a
        href="https://warpcast.com/~/channel/puzzlebets"
        class="flex gap-2 items-center text-purple-800 font-bold"
      >
        <div class="w-6 h-6">
          <Warpcast />
        </div>
        Puzzle Bets on Farcaster
      </a>

      <a
        href="https://github.com/jaxernst/puzzle-bets"
        class="flex gap-2 items-center text-neutral-800 font-bold"
      >
        <div class="w-6 h-6">
          <Github />
        </div>
        Puzzle Bets source code
      </a>

      <p
        class="p-4 text-neutral-600 font-medium w-full flex justify-center gap-2"
      >
        By
        <a
          href="https://jaxer.eth.co"
          class="font-bold text-blue-600"
          target="_blank"
        >
          jaxer.eth.co
        </a>
        :)
      </p>
    </div>
    <div class="h-[80px]"></div>
  </div>
</div>
