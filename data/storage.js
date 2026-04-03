import { saveData, loadData, deleteData, clearAllData } from "./data/storage.js";

// Save data
export function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Load data
export function loadData(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// Delete one item
export function deleteData(key) {
  localStorage.removeItem(key);
}

// Clear everything (use carefully)
export function clearAllData() {
  localStorage.clear();
}
