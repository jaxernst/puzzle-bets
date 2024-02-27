<script lang="ts">
  import { browser } from "$app/environment";
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

  function setThemeColor(color: string) {
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", color);
    } else {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      metaThemeColor.setAttribute("content", color);
      document.getElementsByTagName("head")[0].appendChild(metaThemeColor);
    }
  }

  // Hack to darken the notch area (by 30%) on ios
  const initThemeColor = "rgb(230, 230, 232)";
  $: if (show) {
    browser && setThemeColor("rgb(161, 161, 162.4)");
  } else {
    browser && setThemeColor(initThemeColor);
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
    class="modal z-50 fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-30 flex justify-center items-center"
    on:click={clickOutside}
    aria-modal="true"
    role="dialog"
    aria-labelledby={title}
    aria-describedby={description}
  >
    <slot />
  </div>
{/if}
