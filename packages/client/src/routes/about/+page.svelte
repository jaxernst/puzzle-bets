<script>
  import AnimatedArrow from "$lib/components/AnimatedArrow.svelte";
  import { slide } from "svelte/transition";
</script>

<div in:slide>
  <a
    href="/welcome"
    class="w-full text-center font-semibold text-neutral-500 flex justify-center items-center"
  >
    Return home
    <AnimatedArrow
      direction="up"
      klass="h-5 w-5 fill-neutral-600 stroke-neutral-400"
    />
  </a>

  <h1 class="text-neutral-800 font-semibold my-4 text-2xl">The Game</h1>

  <p class="text-neutral-600 font-medium">
    Puzzle bets is a player vs player onchain competitive puzzle game. Players
    can challenge each other to puzzles, and place wagers on the results.
  </p>

  <h2 class="mt-4 text-lg text-lime-500 font-bold">How to Play</h2>
  <p class="text-neutral-600 font-medium">
    Players can challenge each other by creating games/matches. To initiate a
    game, a player deposits their funds into a smart contract and copies a
    generated invite link. After sharing this invite link, the second player can
    join and start the game. Once started, an identical puzzle is revealed for
    both players and the clock starts ticking.
  </p>

  <h2 class="mt-4 text-lg text-lime-500 font-bold">Winning the pot</h2>

  <p class="text-neutral-600 font-medium">
    Different puzzles will have different criteria to determine a victor.
    Currently, only <span class="font-bold">Wordle</span> is supported. In order
    to win the Wordle pot, you must be the sole player to solve the Wordle in the
    allotted time. In the event of a tie, the game may be restarted until a victor
    emerges.
  </p>

  <h1 class="text-neutral-800 font-semibold mb-4 mt-8 text-2xl">The Project</h1>

  <p class="text-neutral-600 font-medium">
    Puzzle bets is being developed in the open! All code, including the smart
    contracts, backend, and frontend are open source and available on Github
  </p>

  <p class="text-neutral-600 font-medium">
    This is an early, unofficial testnet release of Puzzle Bets. Any feedback or
    bugs reports are welcome on github, Farcaster, or Twitter.
  </p>

  <h2 class="mt-4 text-lg text-lime-500 font-bold">Reach Out!</h2>

  <p class="text-neutral-600 font-medium">
    All links + socials can be found at <a
      href="https://jaxer.eth.co"
      class="font-bold text-blue-600"
      target="_blank"
    >
      jaxer.eth.co
    </a>
    :)
  </p>
</div>
