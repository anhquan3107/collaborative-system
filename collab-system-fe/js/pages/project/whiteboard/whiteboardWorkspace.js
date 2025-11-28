// ------------------------------
// Import API modules
// ------------------------------
import {
  listWhiteboards,
  createWhiteboard,
  getWhiteboard,
  saveWhiteboard,
} from "../../../../api/whiteboard.js";

import { notyf } from "../../../../vendor/utils/notify.js";

// ------------------------------
// Globals
// ------------------------------
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("projectId");
const projectName = urlParams.get("projectName") || "Untitled";

let socket = null;
let currentBoardId = null;

let strokes = [];
let drawing = false;
let saveTimer = null;

let canvas, ctx;


// ------------------------------
// Init
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (!projectId) return;

  document.getElementById("projectName").textContent = projectName;
  console.log("🔥 DOMContentLoaded fired in whiteboardWorkspace.js");

  initCanvas();
  initSocket();
  loadWhiteboards();
  setupEvents();

  showPlaceholder();
});

// ------------------------------
// Canvas
// ------------------------------
function initCanvas() {
  canvas = document.getElementById("whiteboardCanvas");
  ctx = canvas.getContext("2d");

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousedown", startStroke);
  canvas.addEventListener("mousemove", drawStroke);
  window.addEventListener("mouseup", endStroke);
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  redraw();
}

function startStroke(e) {
  drawing = true;
  strokes.push({ color: "#000", size: 2, points: [] });
  addPoint(e);
}

function drawStroke(e) {
  if (!drawing) return;
  addPoint(e);
  broadcastStroke();
  redraw();
}

function endStroke() {
  drawing = false;

  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveCurrentWhiteboard, 1200);
}

function addPoint(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  strokes[strokes.length - 1].points.push({ x, y });
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const stroke of strokes) {
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.beginPath();
    stroke.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  }
}

// ------------------------------
// Socket.io
// ------------------------------
function initSocket() {
  socket = io();

  socket.on("connect", () => {
    updateStatus("Connected", "text-success");
    if (currentBoardId) socket.emit("join_whiteboard", { boardId: currentBoardId });
  });

  socket.on("disconnect", () => {
    updateStatus("Disconnected", "text-danger");
  });

  socket.on("whiteboard_stroke", (data) => {
    if (data.boardId !== currentBoardId) return;
    strokes.push(data.stroke);
    redraw();
  });

  socket.on("whiteboard_saved", (data) => {
    const ts = new Date(data.updatedAt).toLocaleString();
    document.getElementById("whiteboardLastSaved").textContent = `Last saved: ${ts}`;
  });
}

function broadcastStroke() {
  if (!currentBoardId) return;
  const stroke = strokes[strokes.length - 1];

  socket.emit("whiteboard_stroke", {
    boardId: currentBoardId,
    stroke,
  });
}

// ------------------------------
// Open Whiteboard
// ------------------------------
async function openWhiteboard(boardId, title) {
  showWhiteboard();

  if (currentBoardId) {
    socket.emit("leave_whiteboard", { boardId: currentBoardId });
  }

  const result = await getWhiteboard(projectId, boardId);
  currentBoardId = boardId;

  strokes = result.whiteboard.strokes ? JSON.parse(result.whiteboard.strokes) : [];
  redraw();

  document.getElementById("boardTitle").textContent = title;

  const last = new Date(result.whiteboard.updated_at).toLocaleString();
  document.getElementById("whiteboardLastSaved").textContent = `Last saved: ${last}`;

  socket.emit("join_whiteboard", { boardId });
  updateStatus("Connected - Collaborative", "text-success");

  updateListUI(boardId);
}

// ------------------------------
// Save Whiteboard
// ------------------------------
async function saveCurrentWhiteboard() {
  if (!currentBoardId) return;

  const content = JSON.stringify(strokes);

  await saveWhiteboard(projectId, currentBoardId, content);

  socket.emit("save_whiteboard", {
    boardId: currentBoardId,
    strokes: content,
  });

  const ts = new Date().toLocaleString();
  document.getElementById("whiteboardLastSaved").textContent = `Last saved: ${ts}`;

  notyf.success("Whiteboard saved!");
}

// ------------------------------
// UI Controls
// ------------------------------
function updateStatus(text, cls) {
  const el = document.getElementById("whiteboardStatus");
  el.textContent = text;
  el.className = "small " + cls;
}

function showPlaceholder() {
  document.getElementById("noBoardPlaceholder").style.display = "flex";
  document.getElementById("whiteboardWrapper").style.display = "none";
}

function showWhiteboard() {
  document.getElementById("noBoardPlaceholder").style.display = "none";
  document.getElementById("whiteboardWrapper").style.display = "flex";
}

// ------------------------------
// Load List
// ------------------------------
async function loadWhiteboards() {
  const result = await listWhiteboards(projectId);
  renderWhiteboardList(result.whiteboards);
}

function renderWhiteboardList(boards) {
  const list = document.getElementById("boardList");

  if (!boards || boards.length === 0) {
    list.innerHTML = '<div class="text-muted">No whiteboards yet</div>';
    return;
  }

  list.innerHTML = boards
    .map(
      (b) => `
      <div class="board-item" data-id="${b.id}" data-title="${b.title}">
        <div class="font-weight-bold">${b.title}</div>
        <small class="text-muted">${new Date(b.updated_at).toLocaleDateString()}</small>
      </div>
      `
    )
    .join("");

  list.querySelectorAll(".board-item").forEach((item) => {
    item.addEventListener("click", () => {
      openWhiteboard(Number(item.dataset.id), item.dataset.title);
    });
  });
}

function updateListUI(activeId) {
  document.querySelectorAll(".board-item").forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.id) === activeId);
  });
}

// ------------------------------
// Events
// ------------------------------
function setupEvents() {
  const createBtn = document.getElementById("createBoardBtn");
  const submitBtn = document.getElementById("createBoardSubmit");

  console.log("📌 setupEvents running", { createBtn, submitBtn });

  if (createBtn) {
    createBtn.addEventListener("click", () => {
      console.log("🎉 Create button clicked");
      $("#createBoardModal").modal("show");
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const title = document.getElementById("newBoardTitle").value.trim();
      if (!title) return notyf.error("Title required");

      const result = await createWhiteboard(projectId, title);

      $("#createBoardModal").modal("hide");
      document.getElementById("newBoardTitle").value = "";

      await loadWhiteboards();
      openWhiteboard(result.whiteboard.id, result.whiteboard.title);
    });
  }

  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

