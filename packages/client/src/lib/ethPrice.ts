import { writable } from "svelte/store";

export const ethPrice = (() => {
  const { subscribe, set } = writable(2600);

  fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD").then(
    async (r) => {
      set((await r.json()).USD);
    }
  );

  return {
    subscribe,
  };
})();
