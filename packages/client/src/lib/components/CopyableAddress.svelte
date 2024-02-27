<script lang="ts">
  import { shortenAddress } from "$lib/util";
  export let address: string;

  let copied = false;
  async function copyInviteUrl() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(address);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }
</script>

<div class="relative p-1 sm:p-2 group">
  <div class="group-hover:opacity-40">{shortenAddress(address)}</div>
  <button
    on:click={copyInviteUrl}
    class="transition-all duration-200 font-normal opacity-0 group-hover:opacity-100 absolute top-0 left-0 flex justify-center items-center text-white rounded-xl bg-gray-600 bg-opacity-60 h-full w-full"
  >
    {copied ? "Copied!" : "Copy"}
  </button>
</div>
