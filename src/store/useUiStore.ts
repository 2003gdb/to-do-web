import { create } from "zustand";

type Filter = "all" | "pending" | "completed";

interface UiState {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export const useUiStore = create<UiState>((set) => ({
  filter: "all",
  setFilter: (filter) => set({ filter }),
}));
