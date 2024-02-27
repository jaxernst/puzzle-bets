<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { slide } from "svelte/transition";
  import AnimatedArrow from "./AnimatedArrow.svelte";

  export let options: string[];
  export let placeholder = "Select an Option";
  export let onOptionSelect: (option: string) => void = () => {};
  export let selection: string | null = null;

  let isOpen = false;

  const toggleDropdown = () => {
    isOpen = !isOpen;
  };

  const selectOption = async (option: string) => {
    selection = option;
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

<div
  class="text-white relative overflow-visible text-sm"
  bind:this={dropdownButton}
>
  <button
    class="flex justify-between whitespace-nowrap< gap-1 items-center bg-pb-yellow p-2 rounded-lg font-semibold"
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    transition:slide={{ axis: "x" }}
    on:click={toggleDropdown}
  >
    {selection ?? placeholder}
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
            class={`rounded-[.36rem] ${
              option === selection
                ? "bg-pb-yellow"
                : "hover:bg-gray-400 transition-color"
            }`}
            role="option"
            aria-selected={selection === option}
          >
            <button class="py-2 px-4" on:click={() => selectOption(option)}>
              {option}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
