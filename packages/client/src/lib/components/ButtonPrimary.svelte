<script>
  import { twMerge } from "tailwind-merge"

  let overrideClass = ""

  export { overrideClass as class }
  export let disabled = false
</script>

<button
  on:click
  class={twMerge(
    "whitespace-nowrap rounded-lg bg-lime-500 px-2 py-1 font-semibold transition-all hover:bg-lime-400 hover:shadow-lg active:bg-lime-600 disabled:opacity-60",
    overrideClass,
  )}
  {disabled}
>
  <slot />
</button>
