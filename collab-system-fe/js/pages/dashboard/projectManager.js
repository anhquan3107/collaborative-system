// projectManager.js
import {
  createProject,
  getProjects,
  deleteProject,
  getProjectCount,
} from "../../../api/project.js";
import { notyf } from "../../../vendor/utils/notify.js";

// Cached DOM elements
const createBtn = document.getElementById("createProjectBtn");
const createSubmit = document.getElementById("createProjectSubmit");
const projectList = document.getElementById("projectList");

// ------------------------------
// PUBLIC INIT FUNCTION
// ------------------------------
export function initProjectManager() {
  setupCreateProjectModal();
  setupDeleteHandler();
  loadLastOpenedProject();
}

export function openProject(projectId, projectName) {
  localStorage.setItem("last_project_id", projectId);
  localStorage.setItem("last_project_name", projectName);
  localStorage.setItem("last_project_date", new Date().toISOString());

  window.location.href =
    `project.html?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`;
}

// -------------------------------------
// CLEAR last project when entering WEBSITE
// -------------------------------------
export function clearRecentProject() {
  localStorage.removeItem("last_project_id");
  localStorage.removeItem("last_project_name");
  localStorage.removeItem("last_project_date");
}

// ------------------------------
// Load Last Open Project
// ------------------------------
export function loadLastOpenedProject() {
  const lastId = localStorage.getItem("last_project_id");
  const lastName = localStorage.getItem("last_project_name");

  const nameEl = document.getElementById("statLastProject");

  if (!lastId || !lastName) {
    nameEl.textContent = "None";
    return;
  }

  const safeName = lastName.replace(/'/g, "\\'");

  nameEl.innerHTML = `
    <a href="#" onclick="event.preventDefault(); openProject(${lastId}, '${safeName}')">
      ${lastName} <i class="fas fa-play-circle text-success"></i>
    </a>
  `;
}

// ------------------------------
// Load Dashboard Stats
// ------------------------------
export async function loadProjectStats() {
  await Promise.all([loadStats(), loadProjects()]);
}

// ------------------------------
// Setup Event Listeners
// ------------------------------
function setupCreateProjectModal() {
  createBtn?.addEventListener("click", () => {
    $("#createProjectModal").modal("show");
  });

  createSubmit?.addEventListener("click", handleCreateProject);
}

async function handleCreateProject() {
  const name = document.getElementById("projectName").value.trim();
  const description = document.getElementById("projectDescription").value.trim();

  if (!name) return notyf.error("Project name required");

  await createProject(name, description);
  $("#createProjectModal").modal("hide");
  document.getElementById("createProjectForm").reset();
  notyf.success("Created!");
  loadProjectStats();
}

// ------------------------------
// Delete Project Handler
// ------------------------------
function setupDeleteHandler() {
  window.deleteProjectHandler = async function (id) {
    if (!confirm("Delete this project?")) return;

    await deleteProject(id);
    notyf.success("Deleted!");

    // Clear recent project if it's this one
    if (localStorage.getItem("last_project_id") == id) {
      clearRecentProject();
      loadLastOpenedProject();
    }

    loadProjectStats();
  };
}

// ------------------------------
// Load Projects into Grid
// ------------------------------
async function loadProjects() {
  const data = await getProjects();
  renderProjectGrid(data.projects);
}

async function loadStats() {
  const el = document.getElementById("statTotalProjects");
  const data = await getProjectCount();
  el.textContent = data.count;
}

// projectManager.js

export function renderProjectGrid(projects) {
  projectList.innerHTML = "";

  if (!projects.length) {
    projectList.innerHTML = `
      <div class='col-12 text-center text-muted'>No projects found.</div>
    `;
    return;
  }

  projects.forEach((project) => {
    projectList.innerHTML += `
      <div class="col-lg-3 col-sm-6 mb-4">
        <div class="card shadow-sm h-100 project-card">
          <div class="card-body d-flex flex-column">
            <div onclick="openProject(${project.id}, '${project.name.replace(/'/g, "\\'")}')">
              <h5 class="text-primary text-truncate">${project.name}</h5>
            </div>

            <div class="mt-auto d-flex justify-content-between">
              <small class="text-gray-500">
                <i class="fas fa-users"></i> Members
              </small>
              <button onclick="deleteProjectHandler(${project.id})"
                      class="btn btn-outline-danger btn-sm">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

