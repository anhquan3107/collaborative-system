// frontend/js/pages/project.js - FIXED
import { createProject, getProjects, deleteProject } from "../../../api/project.js";

// DOM elements
const createBtn = document.getElementById("createProjectBtn");
const createSubmit = document.getElementById("createProjectSubmit");
const projectList = document.getElementById("projectList");

// --------------------
// Open Project Function (MOVE OUTSIDE forEach)
// --------------------
window.openProject = function(projectId, projectName) {
    window.location.href = `project.html?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}`;
};

// --------------------
// Open Create Modal
// --------------------
createBtn?.addEventListener("click", () => {
    $("#createProjectModal").modal("show");
});

// --------------------
// Submit New Project
// --------------------
createSubmit?.addEventListener("click", async () => {
    const name = document.getElementById("projectName").value.trim();
    const description = document.getElementById("projectDescription").value.trim();

    if (!name) {
        alert("Project name required");
        return;
    }

    try {
        const result = await createProject(name, description);
        console.log(result);

        $("#createProjectModal").modal("hide");
        document.getElementById("createProjectForm").reset();

        loadProjects();   // refresh UI
    } catch (err) {
        console.error(err);
        alert("Failed to create project");
    }
});
    window.addEventListener('project:joined', () => {
        console.log("🔔 Invitation accepted, refreshing project list...");
        loadProjects();
    });

// --------------------
// Load Projects on Page
// --------------------
export async function loadProjects() {
    try {
        const data = await getProjects();

        projectList.innerHTML = "";

        if (data.projects.length === 0) {
            projectList.innerHTML = "<p>No projects yet.</p>";
            return;
        }

        data.projects.forEach((project) => {
            projectList.innerHTML += `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div style="cursor: pointer;" onclick="openProject(${project.id}, '${project.name.replace(/'/g, "\\'")}')">
                                <h5 class="card-title mb-1">${project.name}</h5>
                                <small class="text-muted">${project.description || "No description"}</small>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="deleteProjectHandler(${project.id})">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (err) {
        console.error("Failed loading projects:", err);
        projectList.innerHTML = "<p class='text-danger'>Failed to load projects</p>";
    }
}

// --------------------
// Delete Project Handler
// --------------------
window.deleteProjectHandler = async function (id) {
    if (!confirm("Delete this project?")) return;

    try {
        await deleteProject(id);
        loadProjects();
    } catch (err) {
        console.error(err);
        alert("Failed to delete project");
    }
};

// Auto-load on page open
loadProjects();