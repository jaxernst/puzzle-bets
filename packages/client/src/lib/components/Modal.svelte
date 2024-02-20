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
    class="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);"
    on:click={clickOutside}
    aria-modal="true"
    role="dialog"
    aria-labelledby={title}
    aria-describedby={description}
  >
    <slot />
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding-top: env(safe-area-inset-top);
    padding-right: env(safe-area-inset-right);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
  }
</style>
