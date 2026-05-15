import { defineStore } from "pinia";

const DEFAULT_TEXT = "Loading...";

export const useLoadingStore = defineStore("loading", {
  state: () => ({
    isLoading: false,
    loadingText: DEFAULT_TEXT,
  }),
  actions: {
    start(text = DEFAULT_TEXT) {
      this.isLoading = true;
      this.loadingText = text;
    },
    stop() {
      this.isLoading = false;
      this.loadingText = DEFAULT_TEXT;
    },
    async run(work, text = DEFAULT_TEXT) {
      this.start(text);
      try {
        return await (typeof work === "function" ? work() : work);
      } finally {
        this.stop();
      }
    },
  },
});
