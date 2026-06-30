// js/storage.js
const STORE_KEY = "fmlokal_save_v1";

const Storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("Gagal memuat save:", e);
      return null;
    }
  },
  save(state) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error("Gagal menyimpan save:", e);
      return false;
    }
  },
  reset() {
    localStorage.removeItem(STORE_KEY);
  }
};
