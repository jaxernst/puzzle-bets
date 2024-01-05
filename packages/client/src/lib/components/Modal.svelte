<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  export let show: boolean;
  export let title: string = "";
  export let description: string = "";

  const dispatch = createEventDispatcher();

  let modal: HTMLElement;

  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  $: if (show) {
    // Focus on the modal when it becomes visible
    modal?.focus();
  }

  function closeModal() {
    dispatch("close");
  }

  function clickOutside(event: MouseEvent) {
    if (event.target === modal) {
      closeModal();
    }
  }
</script>

<!-- Trigger button in parent component -->
<!-- <button on:click={() => (show = true)}>Open Modal</button> -->

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div
    bind:this={modal}
    tabindex="-1"
    class="z-50 absolute w-screen h-screen inset-0 bg-black bg-opacity-30 flex justify-center items-center"
    on:click={clickOutside}
    aria-modal="true"
    role="dialog"
    aria-labelledby={title}
    aria-describedby={description}
  >
    <slot />
  </div>
{/if}
