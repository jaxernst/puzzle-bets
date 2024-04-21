<script>
  import { twMerge } from "tailwind-merge"

  let overrideClass = ""

  export { overrideClass as class }
</script>

<button
  on:click
  class={twMerge(
    "rounded-lg bg-lime-500 px-2 py-1 transition-all hover:bg-lime-400 hover:shadow-lg active:bg-lime-600",
    overrideClass,
  )}
>
  <slot />
</button>
