<script lang="ts">
  import { onMount } from "svelte";
  import WordleGame from "../WordleGame.svelte";
  import { Game } from "../game";

  let game: Game = new Game();
  onMount(() => {
    game = new Game();
  });

  $: guesses = game?.guesses;
  $: answers = game?.answers;
  $: answer = game?.answer;
  $: badGuess = false;

  console.log(game.answer);
</script>

<WordleGame
  data={{
    guesses,
    answers,
    answer,
    badGuess,
  }}
  on:restart={() => {}}
  on:submitGuess={(e) => {
    // Will return bad guess or
    console.log(e);
    console.log(game.guesses);
    let guessValid = game.enter(e.detail.guess.split());
    badGuess = !guessValid;
    guesses = game.guesses;
    answers = game.answers;
    if (guesses.length >= 6) answer = game.answer;
  }}
/>
