// frontend/js/pages/project/project.js
import {
  createProject,
  getProjects,
  deleteProject,
  getProjectCount,
} from "../../../api/project.js";
import { notyf } from "../../../vendor/utils/notify.js";

// DOM elements
const createBtn = document.getElementById("createProjectBtn");
const createSubmit = document.getElementById("createProjectSubmit");
const projectList = document.getElementById("projectList");

// --------------------
// Open Project Function (Saves to LocalStorage)
// --------------------
window.openProject = function (projectId, projectName) {
  localStorage.setItem("last_project_id", projectId);
  localStorage.setItem("last_project_name", projectName);
  localStorage.setItem("last_project_date", new Date().toISOString());
  window.location.href = `project.html?projectId=${projectId}&projectName=${encodeURIComponent(
    projectName
  )}`;
};

// --------------------
// ✅ UPDATE: Load "Last Open Project" (Clickable Text, No Button)
// --------------------
function loadLastOpenedProject() {
  const lastId = localStorage.getItem("last_project_id");
  const lastName = localStorage.getItem("last_project_name");

  const nameEl = document.getElementById("statLastProject");
  const btnContainer = document.getElementById("lastProjectBtnContainer");

  if (!nameEl) return;

  // 1. Always clear the button container (we don't want the big button anymore)
  if (btnContainer) btnContainer.innerHTML = "";

  if (lastId && lastName) {
    const safeName = lastName.replace(/'/g, "\\'");

    // 2. Inject clickable HTML directly into the Name element
    // We add a small play icon to indicate it's "Continuable"
    nameEl.innerHTML = `
            <a href="#" 
               onclick="event.preventDefault(); openProject(${lastId}, '${safeName}')"
               class="text-gray-800"
               style="text-decoration: none; transition: color 0.2s;"
               onmouseover="this.style.color='#4e73df'" 
               onmouseout="this.style.color='#5a5c69'"
               title="Continue working on ${lastName}"
            >
               ${lastName} <i class="fas fa-play-circle fa-xs ml-1 text-success"></i>
            </a>
        `;
  } else {
    nameEl.textContent = "None";
  }
}

// --------------------
// Global Refresh Handler
// --------------------
window.loadDashboardStats = async function () {
  const btn = document.querySelector("button[onclick='loadDashboardStats()']");
  const icon = btn?.querySelector("i");
  if (icon) icon.classList.add("fa-spin");

  try {
    await Promise.all([loadStats(), loadProjects()]);

    loadLastOpenedProject();
  } catch (err) {
    console.error("Refresh failed", err);
    notyf.error("Could not refresh stats");
  } finally {
    if (icon) icon.classList.remove("fa-spin");
  }
};

// --------------------
// Open Create Modal
// --------------------
createBtn?.addEventListener("click", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    notyf.error("Please login first to create a project");
    return;
  }
  $("#createProjectModal").modal("show");
});

// --------------------
// Submit New Project
// --------------------
createSubmit?.addEventListener("click", async () => {
  const name = document.getElementById("projectName").value.trim();
  const description = document
    .getElementById("projectDescription")
    .value.trim();

  if (!name) {
    notyf.error("Project name required");
    return;
  }

  try {
    await createProject(name, description);
    $("#createProjectModal").modal("hide");
    document.getElementById("createProjectForm").reset();
    notyf.success("Project created successfully");
    window.loadDashboardStats();
  } catch (err) {
    console.error(err);
    notyf.error("Failed to create project");
  }
});

// --------------------
// Invitation Accepted Event
// --------------------
window.addEventListener("project:joined", () => {
  console.log("🔔 Invitation accepted, refreshing...");
  window.loadDashboardStats();
});

// --------------------
// Load Dashboard Stats
// --------------------
async function loadStats() {
  const countEl = document.getElementById("statTotalProjects");
  if (!countEl) return;

  try {
    const data = await getProjectCount();
    countEl.textContent = data.count;
  } catch (err) {
    console.error("Failed to load project stats:", err);
    countEl.textContent = "-";
  }
}

// --------------------
// Load Projects (Grid)
// --------------------
export async function loadProjects() {
  try {
    const data = await getProjects();
    projectList.innerHTML = "";

    if (data.projects.length === 0) {
      projectList.innerHTML =
        "<div class='col-12'><p class='text-center text-muted'>No projects yet.</p></div>";
      return;
    }

    data.projects.forEach((project) => {
      projectList.innerHTML += `
                <div class="col-xl-20 col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card shadow-sm h-100 project-card">
                        <div class="card-body d-flex flex-column">
                            <div style="cursor: pointer;" class="mb-2 flex-grow-1" onclick="openProject(${
                              project.id
                            }, '${project.name.replace(/'/g, "\\'")}')">
                                <h5 class="card-title mb-1 text-primary font-weight-bold text-truncate" title="${
                                  project.name
                                }">${project.name}</h5>
                                <p class="card-text small text-muted text-truncate">${
                                  project.description || "No description"
                                }</p>
                            </div>
                            
                            <div class="mt-auto d-flex justify-content-between align-items-center">
                                <small class="text-gray-500"><i class="fas fa-users"></i> Members</small>
                                <button class="btn btn-outline-danger btn-sm py-0" style="font-size: 0.8rem;" onclick="deleteProjectHandler(${
                                  project.id
                                })">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    });
  } catch (err) {
    console.error("Failed loading projects:", err);
    projectList.innerHTML =
      "<div class='col-12'><p class='text-danger text-center'>No projects found</p></div>";
  }
}

// --------------------
// Delete Project Handler
// --------------------
window.deleteProjectHandler = async function (id) {
  if (!confirm("Delete this project?")) return;

  try {
    await deleteProject(id);
    notyf.success("Project deleted");
    window.loadDashboardStats();

    if (localStorage.getItem("last_project_id") == id) {
      localStorage.removeItem("last_project_id");
      localStorage.removeItem("last_project_name");
      loadLastOpenedProject();
    }
  } catch (err) {
    console.error(err);
    notyf.error("Failed to delete project");
  }
};

// --------------------
// Auto-load on page open
// --------------------
if (localStorage.getItem("token")) {
  window.loadDashboardStats();
}
