// frontend/js/pages/dashboard/searchManager.js
import { getProjects } from "../../../api/project.js";
import { openProject } from "./projectManager.js";
import { renderProjectGrid } from "./projectManager.js";
let searchInput = null;
let debounceTimer = null;

/**
 * Initialize project search
 * Called ONCE from main.js
 */
export function initSearchManager() {
  searchInput = document.querySelector(".navbar-search input");

  if (!searchInput) {
    console.warn("⚠️ Search input not found");
    return;
  }

  searchInput.addEventListener("input", onSearchInput);
}

/**
 * Handle typing in search bar
 */
function onSearchInput(e) {
  const keyword = e.target.value.trim();

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchProjects(keyword);
  }, 300); // debounce
}

/**
 * Call backend to search projects
 */
async function searchProjects(keyword) {
  try {
    const res = await getProjects(
      keyword ? { search: keyword } : {}
    );

    renderProjectGrid(res.projects || []);
  } catch (err) {
    console.error("❌ Project search failed:", err);
  }
}

