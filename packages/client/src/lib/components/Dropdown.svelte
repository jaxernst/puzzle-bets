<script lang="ts">
  import BackArrow from "$lib/icons/BackArrow.svelte";
  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import AnimatedArrow from "./AnimatedArrow.svelte";
  import { bounceInOut, bounceOut, cubicIn } from "svelte/easing";

  export let options: string[];
  export let placeholder = "Select an Option";
  export let onOptionSelect: (option: string) => void = () => {};

  let isOpen = false;
  let selectedOption = "";

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  const selectOption = async (option: string) => {
    selectedOption = option;
    setTimeout(() => {
      onOptionSelect(option);
      isOpen = false;
    }, 10);
  };

  let dropdownButton: HTMLDivElement;

  const handleClickOutside = (event: any) => {
    if (!dropdownButton.contains(event.target)) {
      isOpen = false;
    }
  };

  onMount(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<div class="relative overflow-visible" bind:this={dropdownButton}>
  <button
    class="flex justify-between gap-1 items-center bg-pb-yellow px-2 p-1 sm:p-2 rounded-lg text-sm font-semibold"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    transition:slide={{ axis: "x" }}
    on:click={toggleDropdown}
  >
    {selectedOption || placeholder}
    <AnimatedArrow
      direction={isOpen ? "up" : "down"}
      klass="fill-white h-5 w-5"
    />
  </button>
  <div class="absolute mt-2 left-1 rounded-lg shadow">
    {#if isOpen}
      <ul
        transition:slide
        class="font-semibold flex flex-col bg-gray-500 rounded-lg"
        role="listbox"
        tabindex="-1"
      >
        {#each options as option}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class={`rounded-[.36rem]  ${
              option === selectedOption ? "bg-pb-yellow" : ""
            }`}
            role="option"
            aria-selected={selectedOption === option}
          >
            <button class="py-3 px-4" on:click={() => selectOption(option)}>
              {option}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
